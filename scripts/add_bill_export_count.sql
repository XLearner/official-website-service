-- 添加账单导出次数字段
ALTER TABLE zh_office_website.orders ADD COLUMN billExportCount INT NOT NULL DEFAULT 0 COMMENT '账单导出次数';
