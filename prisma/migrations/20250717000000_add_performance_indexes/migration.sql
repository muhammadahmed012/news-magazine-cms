-- CreateIndex
CREATE INDEX "Post_status_publishedAt_idx" ON "Post"("status", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "Post_categoryId_idx" ON "Post"("categoryId");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE INDEX "Post_viewCount_idx" ON "Post"("viewCount" DESC);

-- CreateIndex
CREATE INDEX "Post_status_isFeatured_publishedAt_idx" ON "Post"("status", "isFeatured", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "Post_status_isTrending_idx" ON "Post"("status", "isTrending");

-- CreateIndex
CREATE INDEX "Post_status_isEditorPick_idx" ON "Post"("status", "isEditorPick");

-- CreateIndex
CREATE INDEX "Post_status_isBreaking_idx" ON "Post"("status", "isBreaking");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "Category_order_idx" ON "Category"("order");

-- CreateIndex
CREATE INDEX "Comment_postId_status_idx" ON "Comment"("postId", "status");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "Ad_placement_status_idx" ON "Ad"("placement", "status");

-- CreateIndex
CREATE INDEX "Ad_status_idx" ON "Ad"("status");
