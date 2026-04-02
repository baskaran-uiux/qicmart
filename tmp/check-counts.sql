SELECT 'Store' as table_name, count(*) as count FROM "Store"
UNION ALL
SELECT 'Product', count(*) FROM "Product"
UNION ALL
SELECT 'Order', count(*) FROM "Order"
UNION ALL
SELECT 'User', count(*) FROM "User"
UNION ALL
SELECT 'ShippingMethod', count(*) FROM "ShippingMethod"
UNION ALL
SELECT 'ShippingZone', count(*) FROM "ShippingZone";
