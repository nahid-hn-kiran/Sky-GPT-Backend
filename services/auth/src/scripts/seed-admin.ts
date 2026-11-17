import { auth, client, db } from '../app/lib/auth';
import { config } from '../app/config';

async function seedAdmin() {
  console.log('--- Initial Admin Seeding ---');

  try {
    await client.connect();
    console.log('[Seed] Connected to MongoDB.');

    const adminEmail = config.seedAdmin.email.toLowerCase();

    // Check if an admin already exists in the Better Auth user collection
    const usersCollection = db.collection('user');
    const existingAdmin = await usersCollection.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`[Seed] Admin with email "${adminEmail}" already exists. Skipping.`);
      process.exit(0);
    }

    console.log(`[Seed] Creating initial admin "${adminEmail}"...`);

    // Use Better Auth's administrative API to create user with password and admin role
    const result = await auth.api.createUser({
      body: {
        email: adminEmail,
        password: config.seedAdmin.password,
        name: config.seedAdmin.name,
        role: 'admin',
      },
    });

    console.log('[Seed] Admin account successfully seeded:');
    console.log(`  - User ID: ${result.user.id}`);
    console.log(`  - Email:   ${result.user.email}`);
    console.log(`  - Role:    ${result.user.role}`);
    console.log('--- Seeding Completed ---');
    process.exit(0);
  } catch (error: any) {
    console.error('[Seed] Error seeding admin:', error.message || error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedAdmin();
