import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/deployflow');
  const db = mongoose.connection.db;

  const org = await db.collection('organisations').findOne({ slug: 'organ' });
  console.log('Found org:', org?._id, org?.name);

  if (org) {
    // Upgrade organ to Pro Plan (250 deployments quota limit!)
    await db.collection('organisations').updateOne(
      { _id: org._id },
      { $set: { plan: 'pro', subscriptionStatus: 'active' } }
    );

    await db.collection('subscriptions').updateOne(
      { orgId: org._id },
      { $set: { plan: 'pro', status: 'active', currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
      { upsert: true }
    );

    // Reset deployments usage to 7 (out of 250!) so they have 243 deployments free!
    await db.collection('usagerecords').deleteMany({ orgId: org._id, metric: 'deployments' });
    await db.collection('usagerecords').insertOne({
      orgId: org._id,
      metric: 'deployments',
      quantity: 7,
      periodStart: new Date(2026, 9, 1),
    });

    console.log('Successfully upgraded organ to Pro Plan with 7/250 deployments!');
  }

  await mongoose.disconnect();
}

run().catch(console.error);
