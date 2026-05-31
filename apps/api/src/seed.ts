import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Drone } from './entities/drone.entity';
import { AppDataSource } from './data-source';

// Seed uses synchronize to create tables in dev — migrations take over in prod
const ds = AppDataSource.setOptions({ synchronize: true });

async function seed() {
  await ds.initialize();

  // Super admin user
  const hash = await bcrypt.hash('admin', 10);
  await ds
    .getRepository(User)
    .upsert([{ name: 'OPS-ADMIN1', email: 'admin@reis.local', password_hash: hash, role: 'super_admin' }], ['email']);

  // 50 drones
  const drones = Array.from({ length: 50 }, (_, i) => {
    const n = i + 1;
    return {
      code: `drone${n}`,
      label: `DRN-${String(n).padStart(3, '0')}`,
      stream_url: `https://stream.r3.army/live/drone${n}/whep`,
      group_id: null,
      status: 'offline' as const,
    };
  });

  for (const d of drones) {
    await ds.getRepository(Drone).upsert([d], ['code']);
  }

  console.log('Seed complete — 1 admin user, 50 drones');
  await ds.destroy();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
