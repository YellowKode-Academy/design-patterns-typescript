export class LegacyPaymentGateway {
  makePayment(
    value: number,
    currency: string,
    ref: string
  ): { success: boolean; transId: string } {
    return {
      success: true,
      transId: `legacy_${ref}_${currency}_${value}`,
    };
  }

  cancelTransaction(transId: string): { cancelled: boolean } {
    return { cancelled: transId.startsWith('legacy_') };
  }
}
