// src/db/services/drug.service.ts

import { db } from '@/db/client';
import type { Prisma } from '@/prisma/types';

export class DrugService {
  // ==================== DRUG DATABASE ====================

  /**
   * Get complete drug database
   */
  async getDrugDatabase() {
    return db.drug.findMany({
      where: {
        createdAt: {
          lte: new Date()
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  /**
   * Get drug by ID
   */
  async getDrugById(id: string) {
    return db.drug.findUnique({
      where: { id }
    });
  }

  /**
   * Get all drugs list
   */
  async getActiveDrugs() {
    return db.drug.findMany({
      select: {
        id: true,
        name: true,
        genericName: true,
        strength: true,
        strengthUnit: true,
        form: true,
        category: true,
        requiresPrescription: true,
        isControlled: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  /**
   * Search drugs by name or generic name
   */
  async searchDrugs(query: string, limit = 20) {
    return db.drug.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { genericName: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        genericName: true,
        strength: true,
        strengthUnit: true,
        form: true,
        category: true,
        requiresPrescription: true,
        isControlled: true
      },
      orderBy: {
        name: 'asc'
      },
      take: limit
    });
  }

  // ==================== DRUG CATEGORIES ====================

  /**
   * Get drugs by category
   */
  async getDrugsByCategory(category: string) {
    return db.drug.findMany({
      where: {
        category
      },
      select: {
        id: true,
        name: true,
        genericName: true,
        strength: true,
        strengthUnit: true,
        form: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  /**
   * Get all unique drug categories
   */
  async getDrugCategories() {
    const drugs = await db.drug.findMany({
      select: {
        category: true
      },
      distinct: ['category']
    });

    return drugs
      .map(d => d.category)
      .filter((c): c is string => c !== null)
      .sort();
  }

  /**
   * Get dose guidelines for a drug
   */
  async getDrugGuidelines(drugId: string) {
    return db.doseGuideline.findMany({
      where: {
        drugId
      },
      include: {
        drug: {
          select: {
            id: true,
            name: true,
            genericName: true
          }
        }
      }
    });
  }
  async getClinicFormulary(
    clinicId: string,
    options?: {
      category?: string;
      search?: string;
      page?: number;
      limit?: number;
      includeInactive?: boolean;
      requiresPrescription?: boolean;
      isControlled?: boolean;
    }
  ) {
    const { category, search, page = 1, limit = 20, requiresPrescription, isControlled } = options || {};

    // Build the where clause for drugs
    const whereClause: Prisma.DrugWhereInput = {};

    // Only include active drugs unless specified otherwise
    // Note: Your model doesn't have an isActive field, so we'll skip or add if you have it
    // If you want to soft delete, you might want to add an isActive field to your model

    if (category) {
      whereClause.category = category;
    }

    if (requiresPrescription !== undefined) {
      whereClause.requiresPrescription = requiresPrescription;
    }

    if (isControlled !== undefined) {
      whereClause.isControlled = isControlled;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get drugs that have been prescribed in this clinic
    // This creates a "formulary" based on actual usage
    const drugsWithPrescriptions = await db.drug.findMany({
      where: {
        ...whereClause,
        prescribedItems: {
          some: {
            prescription: {
              clinicId
            }
          }
        }
      },
      include: {
        guidelines: true,
        _count: {
          select: {
            prescribedItems: {
              where: {
                prescription: {
                  clinicId
                }
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Apply pagination manually since we need to count first
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = drugsWithPrescriptions.slice(startIndex, endIndex);
    const total = drugsWithPrescriptions.length;

    // Enhance items with clinic-specific data
    const enhancedItems = await Promise.all(
      paginatedItems.map(async drug => {
        // Get prescription count for this drug in this clinic
        const prescriptionCount = await db.prescribedItem.count({
          where: {
            drugId: drug.id,
            prescription: {
              clinicId
            }
          }
        });

        // Get last prescribed date
        const lastPrescribed = await db.prescribedItem.findFirst({
          where: {
            drugId: drug.id,
            prescription: {
              clinicId
            }
          },
          orderBy: {
            prescription: {
              issuedDate: 'desc'
            }
          },
          include: {
            prescription: {
              select: {
                issuedDate: true
              }
            }
          }
        });

        // Determine if this is a "preferred" drug based on usage frequency
        const totalPrescriptions = await db.prescribedItem.count({
          where: {
            prescription: {
              clinicId
            }
          }
        });

        const drugUsagePercentage = totalPrescriptions > 0 ? (prescriptionCount / totalPrescriptions) * 100 : 0;

        // Consider drugs used in >5% of prescriptions as "preferred"
        const isPreferred = drugUsagePercentage > 5;

        return {
          id: drug.id,
          name: drug.name,
          genericName: drug.genericName,
          strength: drug.strength,
          strengthUnit: drug.strengthUnit,
          form: drug.form,
          category: drug.category,
          requiresPrescription: drug.requiresPrescription,
          isControlled: drug.isControlled,
          guidelines: drug.guidelines,
          // Clinic-specific computed fields
          prescriptionCount,
          lastPrescribedDate: lastPrescribed?.prescription.issuedDate,
          usagePercentage: Math.round(drugUsagePercentage * 100) / 100,
          isPreferred,
          // Formulary status (always 'formulary' if it's been prescribed)
          status: 'formulary',
          hasRestrictions: false // You can add logic for restrictions if needed
        };
      })
    );

    return {
      items: enhancedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1
      },
      summary: {
        totalFormularyItems: total,
        totalDrugs: await db.drug.count(),
        preferredCount: enhancedItems.filter(i => i.isPreferred).length,
        controlledSubstancesCount: enhancedItems.filter(i => i.isControlled).length,
        prescriptionRequiredCount: enhancedItems.filter(i => i.requiresPrescription).length
      }
    };
  }

  /**
   * Alternative approach: Get clinic formulary with pagination using raw query for efficiency
   * This might be more performant for large datasets
   */
  async getClinicFormularyOptimized(
    clinicId: string,
    options?: {
      category?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const { category, search, page = 1, limit = 20 } = options || {};

    const skip = (page - 1) * limit;

    // Build the where clause
    const whereClause: Prisma.DrugWhereInput = {};

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get drugs with prescription counts in a single query using aggregation
    const [items, total] = await Promise.all([
      db.drug.findMany({
        where: whereClause,
        include: {
          guidelines: true,
          // Include prescription counts filtered by clinic
          prescribedItems: {
            where: {
              prescription: {
                clinicId
              }
            },
            select: {
              id: true,
              prescription: {
                select: {
                  issuedDate: true
                }
              }
            },
            orderBy: {
              prescription: {
                issuedDate: 'desc'
              }
            },
            take: 1 // Just get the most recent for last prescribed date
          },
          _count: {
            select: {
              prescribedItems: {
                where: {
                  prescription: {
                    clinicId
                  }
                }
              }
            }
          }
        },
        orderBy: {
          name: 'asc'
        },
        skip,
        take: limit
      }),
      db.drug.count({
        where: {
          ...whereClause,
          prescribedItems: {
            some: {
              prescription: {
                clinicId
              }
            }
          }
        }
      })
    ]);

    // Get total prescriptions count for percentage calculation
    const totalPrescriptions = await db.prescribedItem.count({
      where: {
        prescription: {
          clinicId
        }
      }
    });

    const enhancedItems = items.map(drug => {
      const prescriptionCount = drug._count.prescribedItems;
      const usagePercentage = totalPrescriptions > 0 ? (prescriptionCount / totalPrescriptions) * 100 : 0;
      const isPreferred = usagePercentage > 5;
      const lastPrescribed = drug.prescribedItems[0]?.prescription.issuedDate;

      return {
        id: drug.id,
        name: drug.name,
        genericName: drug.genericName,
        strength: drug.strength,
        strengthUnit: drug.strengthUnit,
        form: drug.form,
        category: drug.category,
        requiresPrescription: drug.requiresPrescription,
        isControlled: drug.isControlled,
        guidelines: drug.guidelines,
        prescriptionCount,
        lastPrescribedDate: lastPrescribed,
        usagePercentage: Math.round(usagePercentage * 100) / 100,
        isPreferred,
        status: 'formulary' // Since it's been prescribed in this clinic
      };
    });

    return {
      items: enhancedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1
      },
      summary: {
        totalFormularyItems: total,
        preferredCount: enhancedItems.filter(i => i.isPreferred).length,
        controlledSubstancesCount: enhancedItems.filter(i => i.isControlled).length
      }
    };
  }

  /**
   * Get drugs NOT in formulary (haven't been prescribed in this clinic)
   */
  async getDrugsNotInFormulary(
    clinicId: string,
    options?: {
      category?: string;
      search?: string;
      limit?: number;
    }
  ) {
    const { category, search, limit = 50 } = options || {};

    const whereClause: Prisma.DrugWhereInput = {
      NOT: {
        prescribedItems: {
          some: {
            prescription: {
              clinicId
            }
          }
        }
      }
    };

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { genericName: { contains: search, mode: 'insensitive' } }
      ];
    }

    return db.drug.findMany({
      where: whereClause,
      include: {
        guidelines: true
      },
      orderBy: {
        name: 'asc'
      },
      take: limit
    });
  }

  /**
   * Check if a drug is in the clinic's formulary (has been prescribed)
   */
  async isDrugInFormulary(clinicId: string, drugId: string) {
    const prescriptionCount = await db.prescribedItem.count({
      where: {
        drugId,
        prescription: {
          clinicId
        }
      }
    });

    return {
      inFormulary: prescriptionCount > 0,
      prescriptionCount,
      lastPrescribed: await db.prescribedItem.findFirst({
        where: {
          drugId,
          prescription: {
            clinicId
          }
        },
        orderBy: {
          prescription: {
            issuedDate: 'desc'
          }
        },
        include: {
          prescription: {
            select: {
              issuedDate: true,
              doctor: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
    };
  }

  // ==================== PRESCRIPTION STATISTICS ====================

  /**
   * Get most prescribed drugs in a clinic
   */
  async getMostPrescribedDrugs(clinicId: string, limit = 10, startDate?: Date, endDate?: Date) {
    const dateFilter: Prisma.PrescriptionWhereInput = {};

    if (startDate && endDate) {
      dateFilter.issuedDate = { gte: startDate, lte: endDate };
    } else if (startDate) {
      dateFilter.issuedDate = { gte: startDate };
    } else if (endDate) {
      dateFilter.issuedDate = { lte: endDate };
    }

    const result = await db.prescribedItem.groupBy({
      by: ['drugId'],
      where: {
        prescription: {
          clinicId,
          ...dateFilter
        }
      },
      _count: {
        _all: true,
        id: true
      },
      _sum: {
        dosageValue: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: limit
    });

    // Enrich with drug details
    const drugIds = result.map(r => r.drugId);
    const drugs = await db.drug.findMany({
      where: {
        id: { in: drugIds }
      },
      select: {
        id: true,
        name: true,
        genericName: true
      }
    });

    const drugMap = new Map(drugs.map(d => [d.id, d]));

    return result.map(r => ({
      drugId: r.drugId,
      drugName: drugMap.get(r.drugId)?.name,
      genericName: drugMap.get(r.drugId)?.genericName,
      prescriptionCount: r._count.id,
      itemCount: r._count._all,
      totalQuantity: r._sum.dosageValue || 0
    }));
  }

  // ==================== CRUD OPERATIONS ====================

  /**
   * Create a new drug (admin only)
   */
  async createDrug(data: Prisma.DrugCreateInput) {
    return db.drug.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  /**
   * Update a drug (admin only)
   */
  async updateDrug(id: string, data: Prisma.DrugUpdateInput) {
    return db.drug.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Delete a drug
   */
  async deleteDrug(id: string) {
    return db.drug.delete({
      where: { id }
    });
  }

  /**
   * Create a dose guideline
   */
  async createDoseGuideline(data: Prisma.DoseGuidelineCreateInput) {
    return db.doseGuideline.create({
      data
    });
  }
}

export const drugService = new DrugService();
