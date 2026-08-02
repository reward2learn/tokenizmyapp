import { createClient } from '@/lib/db';

async function verifyMaterialization() {
  const db = createClient();
  
  try {
    // Check app_pages
    const pages = await db.$queryRawUnsafe<any[]>(`
      SELECT slug, title, auth_tier, nav_label 
      FROM app_pages 
      WHERE tenant_slug = 'tokenizmyapp' 
      AND slug LIKE 'pack-build-an-app-pack-for-restaurant%'
      ORDER BY slug
    `);
    console.log('📄 App Pages:');
    pages.forEach(p => console.log(`   - ${p.slug}: ${p.title} (auth: ${p.auth_tier}, nav: ${p.nav_label})`));

    // Check page_sections
    const sections = await db.$queryRawUnsafe<any[]>(`
      SELECT ps.page_id, ps.block_type, ps.config, ps.sort_order 
      FROM page_sections ps
      JOIN app_pages ap ON ps.page_id = ap.id
      WHERE ap.tenant_slug = 'tokenizmyapp' 
      AND ap.slug LIKE 'pack-build-an-app-pack-for-restaurant%'
      ORDER BY ps.page_id, ps.sort_order
    `);
    console.log('\n🧩 Page Sections:');
    sections.forEach(s => console.log(`   - page_id: ${s.page_id}, block: ${s.block_type}, order: ${s.sort_order}`));

    // Check navigation_items
    const nav = await db.$queryRawUnsafe<any[]>(`
      SELECT slug, label, parent_id, sort_order 
      FROM navigation_items 
      WHERE tenant_slug = 'tokenizmyapp' 
      AND slug LIKE 'pack-build-an-app-pack-for-restaurant%'
      ORDER BY sort_order
    `);
    console.log('\n🧭 Navigation Items:');
    nav.forEach(n => console.log(`   - ${n.slug}: ${n.label} (parent: ${n.parent_id || 'root'}, order: ${n.sort_order})`));

    // Check knowledge_snippets - use correct column names
    const snippets = await db.$queryRawUnsafe<any[]>(`
      SELECT key as slug, content, category 
      FROM knowledge_snippets 
      WHERE tenant_slug = 'tokenizmyapp' 
      AND key LIKE 'pack-build-an-app-pack-for-restaurant%'
      ORDER BY key
    `);
    console.log('\n📝 Knowledge Snippets:');
    snippets.forEach(s => console.log(`   - ${s.slug}: ${s.content.substring(0, 50)}... (category: ${s.category})`));

    // Check security_groups
    const groups = await db.$queryRawUnsafe<any[]>(`
      SELECT code, name, description 
      FROM security_groups 
      WHERE code LIKE 'pack-build-an-app-pack-for-restaurant%'
      ORDER BY code
    `);
    console.log('\n🔐 Security Groups:');
    groups.forEach(g => console.log(`   - ${g.code}: ${g.name}`));

    console.log('\n✅ Verification complete!');
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await db.$disconnect();
  }
}

verifyMaterialization();
