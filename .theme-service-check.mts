import { createRawClient } from './src/lib/db';
import { getAppSettings, updateAppSettings } from './src/domain/config/app-settings-service';

const db = createRawClient();
try {
  const before = await getAppSettings(db, 'tokenizmyapp');
  console.log('BEFORE themeMode:', before.themeMode);
  const updated = await updateAppSettings(db, { themeMode: 'dark' }, 'tokenizmyapp');
  console.log('AFTER themeMode:', updated.themeMode);
  const reread = await getAppSettings(db, 'tokenizmyapp');
  console.log('REREAD themeMode:', reread.themeMode);
  await updateAppSettings(db, { themeMode: before.themeMode }, 'tokenizmyapp');
  console.log('RESTORED:', (await getAppSettings(db, 'tokenizmyapp')).themeMode);
} finally {
  await db.$disconnect();
}
