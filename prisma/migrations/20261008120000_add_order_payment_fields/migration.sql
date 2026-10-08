ALTER TABLE "CustomerOrder" ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'COD';
ALTER TABLE "CustomerOrder" ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'COD_PENDING';
ALTER TABLE "CustomerOrder" ADD COLUMN "gatewayOrderId" TEXT;
ALTER TABLE "CustomerOrder" ADD COLUMN "gatewayPaymentId" TEXT;

CREATE UNIQUE INDEX "CustomerOrder_gatewayOrderId_key" ON "CustomerOrder"("gatewayOrderId");
CREATE UNIQUE INDEX "CustomerOrder_gatewayPaymentId_key" ON "CustomerOrder"("gatewayPaymentId");
