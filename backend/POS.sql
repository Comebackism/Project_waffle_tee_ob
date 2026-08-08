-- Drop existing tables to recreate
DROP TABLE IF EXISTS "Order_Item_Topping" CASCADE;
DROP TABLE IF EXISTS "Order_Item" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "Status" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Role" CASCADE;
DROP TABLE IF EXISTS "MenuComponent" CASCADE;
DROP TABLE IF EXISTS "Invoice" CASCADE;
DROP TABLE IF EXISTS "Stock" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Topping" CASCADE;
DROP TABLE IF EXISTS "Menu" CASCADE;

-- 1. Role
CREATE TABLE "Role" (
    "Role_id" VARCHAR(10) PRIMARY KEY,
    "RoleName" VARCHAR(50) NOT NULL
);

-- 2. User
CREATE TABLE "User" (
    "user_id" VARCHAR(10) PRIMARY KEY,
    "firstname" VARCHAR(100) NOT NULL,
    "lastname" VARCHAR(100) NOT NULL,
    "username" VARCHAR(50) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(15),
    "email" VARCHAR(100),
    "Role_id" VARCHAR(10) REFERENCES "Role"("Role_id")
);

-- 3. Menu (Waffle Menu)
CREATE TABLE "Menu" (
    "menu_id" VARCHAR(10) PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN DEFAULT TRUE,
    "Picture" VARCHAR(255),
    "Calories" DECIMAL(10,2)
);

-- 4. Topping
CREATE TABLE "Topping" (
    "topping_id" VARCHAR(10) PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN DEFAULT TRUE,
    "Picture" VARCHAR(255),
    "Calories" DECIMAL(10,2)
);

-- 5. Product (Raw Materials)
CREATE TABLE "Product" (
    "ProductID" VARCHAR(10) PRIMARY KEY,
    "ProductName" VARCHAR(100) NOT NULL
);

-- 6. MenuComponent (Recipe)
CREATE TABLE "MenuComponent" (
    "menu_id" VARCHAR(10) REFERENCES "Menu"("menu_id"),
    "ProductID" VARCHAR(10) REFERENCES "Product"("ProductID"),
    "Weight" DECIMAL(10,2) NOT NULL,
    PRIMARY KEY ("menu_id", "ProductID")
);

-- 7. Stock
CREATE TABLE "Stock" (
    "stock_id" VARCHAR(10) PRIMARY KEY,
    "ProductID" VARCHAR(10) REFERENCES "Product"("ProductID"),
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "unit" VARCHAR(20),
    "last_update" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Invoice (Inventory Logs)
CREATE TABLE "Invoice" (
    "InvoiceNo" VARCHAR(20) PRIMARY KEY,
    "InvDate" DATE DEFAULT CURRENT_DATE,
    "ProductId" VARCHAR(10) REFERENCES "Product"("ProductID"),
    "Weight" DECIMAL(10,2) NOT NULL
);

-- 9. Status (Order Status)
CREATE TABLE "Status" (
    "status_id" VARCHAR(10) PRIMARY KEY,
    "statusname" VARCHAR(50) NOT NULL
);

-- 10. Order
CREATE TABLE "Order" (
    "order_id" VARCHAR(10) PRIMARY KEY,
    "queue_number" VARCHAR(10),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "Status_id" VARCHAR(10) REFERENCES "Status"("status_id"),
    "user_id" VARCHAR(10) REFERENCES "User"("user_id"),
    "pay_method" VARCHAR(20),
    "total_amount" DECIMAL(10,2),
    "pay_time" TIMESTAMP,
    "slip_picture" VARCHAR(255),
    "note" VARCHAR(255)
);

-- 11. Order_Item
CREATE TABLE "Order_Item" (
    "order_item_id" VARCHAR(10) PRIMARY KEY,
    "order_id" VARCHAR(10) REFERENCES "Order"("order_id") ON DELETE CASCADE,
    "menu_id" VARCHAR(10) REFERENCES "Menu"("menu_id"),
    "quantity" INT NOT NULL DEFAULT 1,
    "note" VARCHAR(255)
);

-- 12. Order_Item_Topping
CREATE TABLE "Order_Item_Topping" (
    "id" SERIAL PRIMARY KEY,
    "order_item_id" VARCHAR(10) REFERENCES "Order_Item"("order_item_id") ON DELETE CASCADE,
    "topping_id" VARCHAR(10) REFERENCES "Topping"("topping_id"),
    "quantity" INT NOT NULL DEFAULT 1
);

-- =========================================================
--  Insert Seed Data
-- =========================================================

-- Roles
INSERT INTO "Role" ("Role_id", "RoleName") VALUES
('R01', 'Admin'),
('R02', 'Cashier'),
('R03', 'Kitchen');

-- Users
INSERT INTO "User" ("user_id", "firstname", "lastname", "username", "password", "Role_id") VALUES
('U01', 'Admin', 'User', 'admin', 'password', 'R01'),
('U02', 'Cashier', 'Staff', 'cashier', 'password', 'R02'),
('U03', 'Kitchen', 'Staff', 'kitchen', 'password', 'R03');

-- Status
INSERT INTO "Status" ("status_id", "statusname") VALUES
('S01', 'รอชำระเงิน'),
('S02', 'รอดำเนินการ'),
('S03', 'กำลังปรุง'),
('S04', 'พร้อมรับ'),
('S05', 'เสร็จสิ้น');

-- Waffle Menus (Using placeholders)
INSERT INTO "Menu" ("menu_id", "name", "price", "is_active", "Picture", "Calories") VALUES
('M01', 'วาฟเฟิลฮ่องกง รสออริจินัล', 45.00, TRUE, 'https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?auto=format&fit=crop&w=400&q=80', 230),
('M02', 'วาฟเฟิลฮ่องกง รสช็อกโกแลต', 50.00, TRUE, 'https://images.unsplash.com/photo-1550508139-8438eb44df88?auto=format&fit=crop&w=400&q=80', 250),
('M03', 'วาฟเฟิลฮ่องกง รสมัทฉะ', 55.00, TRUE, 'https://images.unsplash.com/photo-1598463539850-9304918e5cc6?auto=format&fit=crop&w=400&q=80', 220);

-- Toppings
INSERT INTO "Topping" ("topping_id", "name", "price", "is_active", "Calories") VALUES
('T01', 'กล้วยหอม', 10.00, TRUE, 60),
('T02', 'ฝอยทอง', 15.00, TRUE, 100),
('T03', 'ช็อกโกแลตชิพ', 10.00, TRUE, 70),
('T04', 'อัลมอนด์', 15.00, TRUE, 90);

-- Raw Materials (Products)
INSERT INTO "Product" ("ProductID", "ProductName") VALUES
('P01', 'แป้งวาฟเฟิลสูตรพิเศษ'),
('P02', 'ช็อกโกแลตชิพ'),
('P03', 'กล่องบรรจุภัณฑ์ (M)'),
('P04', 'ไข่ไก่สด (เบอร์ 2)');

-- Stock
INSERT INTO "Stock" ("stock_id", "ProductID", "quantity", "unit") VALUES
('ST01', 'P01', 15.0, 'กิโลกรัม'),
('ST02', 'P02', 1.5, 'กิโลกรัม'),
('ST03', 'P03', 450, 'ชิ้น'),
('ST04', 'P04', 0, 'ฟอง');

-- Menu Recipe (MenuComponent)
INSERT INTO "MenuComponent" ("menu_id", "ProductID", "Weight") VALUES
('M01', 'P01', 100),
('M01', 'P03', 1),
('M02', 'P01', 100),
('M02', 'P02', 20),
('M02', 'P03', 1),
('M03', 'P01', 100),
('M03', 'P03', 1);