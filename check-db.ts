import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const [posts, cats, users, settings, tags, pages, ads] = await Promise.all([
    p.post.count(),
    p.category.count(),
    p.user.count(),
    p.setting.count(),
    p.tag.count(),
    p.page.count(),
    p.ad.count(),
  ]);
  console.log("Posts:", posts);
  console.log("Categories:", cats);
  console.log("Users:", users);
  console.log("Settings:", settings);
  console.log("Tags:", tags);
  console.log("Pages:", pages);
  console.log("Ads:", ads);
  await p.$disconnect();
}
main();
