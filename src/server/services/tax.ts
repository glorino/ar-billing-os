import { db } from '@/lib/db';
import {
  taxRates,
  taxRules,
  taxExemptions,
  type TaxRate,
  type NewTaxRate,
  type TaxRule,
  type NewTaxRule,
  type TaxExemption,
  type NewTaxExemption,
} from '@/lib/db/schema';
import { eq, and, sql, gte, lte, desc } from 'drizzle-orm';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export interface TaxCalculationItem {
  productCategory?: string;
  amount: string;
  quantity?: number;
  shippingCountry?: string;
  shippingRegion?: string;
}

export interface TaxCalculationResult {
  items: {
    amount: string;
    taxRate: string;
    taxAmount: string;
    taxRateId: string;
    taxRateName: string;
    jurisdiction: string | null;
    category: string;
  }[];
  totalTax: string;
  totalAmount: string;
  totalWithTax: string;
}

export class TaxService {
  static async createRate(
    tenantId: string,
    data: Omit<NewTaxRate, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
  ): Promise<TaxRate> {
    const existing = await db.query.taxRates.findFirst({
      where: and(
        eq(taxRates.tenantId, tenantId),
        eq(taxRates.code, data.code),
      ),
    });
    if (existing) {
      throw new AppError('Tax rate code already exists', 'TAX_RATE_CODE_EXISTS', 409);
    }
    const [created] = await db
      .insert(taxRates)
      .values({ ...data, tenantId })
      .returning();
    return created;
  }

  static async getRateById(tenantId: string, rateId: string): Promise<TaxRate> {
    const rate = await db.query.taxRates.findFirst({
      where: and(eq(taxRates.tenantId, tenantId), eq(taxRates.id, rateId)),
    });
    if (!rate) {
      throw new AppError('Tax rate not found', 'TAX_RATE_NOT_FOUND', 404);
    }
    return rate;
  }

  static async listRates(
    tenantId: string,
    params: { activeOnly?: boolean } = {},
  ): Promise<TaxRate[]> {
    const conditions = [eq(taxRates.tenantId, tenantId)];
    if (params.activeOnly) conditions.push(eq(taxRates.isActive, true));
    return db.query.taxRates.findMany({
      where: and(...conditions),
      orderBy: desc(taxRates.createdAt),
    });
  }

  static async updateRate(
    tenantId: string,
    rateId: string,
    data: Partial<Omit<NewTaxRate, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<TaxRate> {
    await this.getRateById(tenantId, rateId);
    const [updated] = await db
      .update(taxRates)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(taxRates.tenantId, tenantId), eq(taxRates.id, rateId)))
      .returning();
    return updated;
  }

  static async deleteRate(tenantId: string, rateId: string): Promise<void> {
    await this.getRateById(tenantId, rateId);
    const [ruleCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(taxRules)
      .where(eq(taxRules.taxRateId, rateId));
    if (ruleCount && ruleCount.count > 0) {
      throw new AppError(
        'Cannot delete tax rate with associated rules',
        'TAX_RATE_HAS_RULES',
        400,
      );
    }
    await db
      .delete(taxRates)
      .where(and(eq(taxRates.tenantId, tenantId), eq(taxRates.id, rateId)));
  }

  static async createRule(
    tenantId: string,
    data: Omit<NewTaxRule, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
  ): Promise<TaxRule> {
    await this.getRateById(tenantId, data.taxRateId);
    const [created] = await db
      .insert(taxRules)
      .values({ ...data, tenantId })
      .returning();
    return created;
  }

  static async listRules(tenantId: string): Promise<TaxRule[]> {
    return db.query.taxRules.findMany({
      where: eq(taxRules.tenantId, tenantId),
      orderBy: sql`${taxRules.priority} desc`,
    });
  }

  static async updateRule(
    tenantId: string,
    ruleId: string,
    data: Partial<Omit<NewTaxRule, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<TaxRule> {
    const existing = await db.query.taxRules.findFirst({
      where: and(eq(taxRules.tenantId, tenantId), eq(taxRules.id, ruleId)),
    });
    if (!existing) {
      throw new AppError('Tax rule not found', 'TAX_RULE_NOT_FOUND', 404);
    }
    const [updated] = await db
      .update(taxRules)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(taxRules.tenantId, tenantId), eq(taxRules.id, ruleId)))
      .returning();
    return updated;
  }

  static async createExemption(
    tenantId: string,
    data: Omit<NewTaxExemption, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
  ): Promise<TaxExemption> {
    const [created] = await db
      .insert(taxExemptions)
      .values({ ...data, tenantId })
      .returning();
    return created;
  }

  static async getExemptionsForCustomer(
    tenantId: string,
    customerId: string,
  ): Promise<TaxExemption[]> {
    return db.query.taxExemptions.findMany({
      where: and(
        eq(taxExemptions.tenantId, tenantId),
        eq(taxExemptions.customerId, customerId),
        eq(taxExemptions.isActive, true),
        sql`(${taxExemptions.validTo} is null or ${taxExemptions.validTo} > now())`,
      ),
    });
  }

  static async listExemptions(
    tenantId: string,
    params: { customerId?: string } = {},
  ): Promise<TaxExemption[]> {
    const conditions = [eq(taxExemptions.tenantId, tenantId)];
    if (params.customerId) {
      conditions.push(eq(taxExemptions.customerId, params.customerId));
    }
    return db.query.taxExemptions.findMany({
      where: and(...conditions),
    });
  }

  static async updateExemption(
    tenantId: string,
    exemptionId: string,
    data: Partial<Omit<NewTaxExemption, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<TaxExemption> {
    const [updated] = await db
      .update(taxExemptions)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(taxExemptions.tenantId, tenantId),
          eq(taxExemptions.id, exemptionId),
        ),
      )
      .returning();
    if (!updated) {
      throw new AppError('Tax exemption not found', 'EXEMPTION_NOT_FOUND', 404);
    }
    return updated;
  }

  static async calculateTax(
    tenantId: string,
    items: TaxCalculationItem[],
    customerId?: string,
  ): Promise<TaxCalculationResult> {
    let customerExempt = false;
    if (customerId) {
      const exemptions = await this.getExemptionsForCustomer(tenantId, customerId);
      if (exemptions.length > 0) customerExempt = true;
    }

    if (customerExempt) {
      return {
        items: items.map((item) => ({
          amount: item.amount,
          taxRate: '0',
          taxAmount: '0',
          taxRateId: '',
          taxRateName: 'Exempt',
          jurisdiction: null,
          category: 'exempt',
        })),
        totalTax: '0',
        totalAmount: items.reduce((sum, item) => sum + Number(item.amount), 0).toFixed(4),
        totalWithTax: items.reduce((sum, item) => sum + Number(item.amount), 0).toFixed(4),
      };
    }

    const rules = await db.query.taxRules.findMany({
      where: and(eq(taxRules.tenantId, tenantId), eq(taxRules.isActive, true)),
      orderBy: sql`${taxRules.priority} desc`,
    });

    const rateCache = new Map<string, TaxRate>();
    const resultItems: TaxCalculationResult['items'] = [];
    let totalTax = 0;
    let totalAmount = 0;

    for (const item of items) {
      const matchingRule = rules.find((rule) => {
        if (rule.productCategory && rule.productCategory !== item.productCategory) return false;
        if (rule.shippingCountry && rule.shippingCountry !== item.shippingCountry) return false;
        if (rule.shippingRegion && rule.shippingRegion !== item.shippingRegion) return false;
        return true;
      });

      let rate = 0;
      let taxRateId = '';
      let taxRateName = 'No Tax';
      let jurisdiction: string | null = null;
      let category = 'standard';

      if (matchingRule) {
        if (!rateCache.has(matchingRule.taxRateId)) {
          const r = await db.query.taxRates.findFirst({
            where: eq(taxRates.id, matchingRule.taxRateId),
          });
          if (r) rateCache.set(matchingRule.taxRateId, r);
        }
        const taxRate = rateCache.get(matchingRule.taxRateId);
        if (taxRate && taxRate.isActive) {
          rate = taxRate.type === 'percentage'
            ? Number(taxRate.rate)
            : (Number(taxRate.rate) / Number(item.amount)) * 100;
          taxRateId = taxRate.id;
          taxRateName = taxRate.name;
          jurisdiction = taxRate.jurisdiction;
          category = taxRate.category;
        }
      }

      const amount = Number(item.amount);
      const taxAmount = amount * (rate / 100);
      totalTax += taxAmount;
      totalAmount += amount;

      resultItems.push({
        amount: item.amount,
        taxRate: rate.toFixed(4),
        taxAmount: taxAmount.toFixed(4),
        taxRateId,
        taxRateName,
        jurisdiction,
        category,
      });
    }

    return {
      items: resultItems,
      totalTax: totalTax.toFixed(4),
      totalAmount: totalAmount.toFixed(4),
      totalWithTax: (totalAmount + totalTax).toFixed(4),
    };
  }

  static async getActiveRatesForJurisdiction(
    tenantId: string,
    country?: string,
    region?: string,
  ): Promise<TaxRate[]> {
    const conditions = [
      eq(taxRates.tenantId, tenantId),
      eq(taxRates.isActive, true),
      sql`(${taxRates.validTo} is null or ${taxRates.validTo} > now())`,
    ];
    if (country) conditions.push(eq(taxRates.country, country));
    if (region) conditions.push(eq(taxRates.region, region));
    return db.query.taxRates.findMany({ where: and(...conditions) });
  }
}
