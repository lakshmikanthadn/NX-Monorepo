import { RequestModel } from '@tandfgroup/pcm-entity-model-v4';

export const collectionProductRequest: RequestModel.Collection[] = [
  {
    _id: 'b1f4b88a-d7e0-4e7a-9dba-447e268f48c2',
    _schemaVersion: '4.0.1',
    _source: {
      source: 'SALESFORCE',
      type: 'product'
    },
    associatedMedia: [],
    categories: [
      {
        code: '',
        name: 'collection-type',
        type: 'xyz'
      },
      {
        code: '',
        name: 'collection-update-type',
        type: 'static'
      }
    ],
    classifications: [],
    collection: {
      abstracts: [
        {
          type: 'text',
          value: "Women's Travel Writing, 1750-1850 Set"
        }
      ],
      autoRollover: false,
      channels: [
        {
          name: 'UBX',
          type: 'delivery'
        }
      ],
      customers: [
        {
          name: 'Institution',
          type: 'customer'
        },
        {
          name: 'Corporate',
          type: 'customer'
        },
        {
          name: 'Consortium',
          type: 'customer'
        },
        {
          name: 'Government',
          type: 'customer'
        }
      ],
      description: '',
      firstPublishedYear: 2021,
      licenses: [
        {
          name: 'Perpetual',
          type: 'license'
        }
      ],
      plannedPublicationDate: '2021-05-01T00:00:00.000Z',
      publisherImprint: '',
      status: 'planned',
      subjectAreaCode: 'HSS',
      subtitle: '',
      taxType: 'Q',
      validFrom: '2021-05-01T00:00:00.000Z'
    },
    contributors: [
      {
        familyName: 'Franklin',
        fullName: 'Caroline Franklin',
        givenName: 'Caroline',
        position: 1,
        roles: ['Editor']
      }
    ],
    identifiers: {
      collectionId: 'RHR-9780429354052',
      doi: '',
      sku: '01t1q000005RyFIAA0'
    },
    partsUpdated: [
      {
        identifier: '06805998-05d6-4bd5-ad2a-313a66139ca7',
        isFree: false,
        position: 1,
        type: 'book'
      },
      {
        identifier: '03852b4e-0e51-4de8-a3c1-2a948b08a25b',
        isFree: false,
        position: 2,
        type: 'book'
      },
      {
        identifier: '056701a8-1211-4c7d-a86d-3a154ec6e8ea',
        isFree: false,
        position: 3,
        type: 'book'
      },
      {
        identifier: '062f4a3c-dacc-4d4f-991b-af61d8a066b0',
        isFree: false,
        position: 4,
        type: 'book'
      },
      {
        identifier: '07be20b5-ae68-48ad-a0bc-f85122a82978',
        isFree: false,
        position: 5,
        type: 'book'
      },
      {
        identifier: '0a7dfa8d-23fd-439a-979b-91767a4e53d7',
        isFree: false,
        position: 6,
        type: 'book'
      },
      {
        identifier: '02a9258b-ce8e-46ab-aba5-2792bf4ab106',
        isFree: false,
        position: 7,
        type: 'book'
      },
      {
        identifier: '04743979-9686-4873-9ddb-b914c509fb56',
        isFree: false,
        position: 8,
        type: 'book'
      },
      {
        identifier: '1b669a2f-4579-4d28-a5ba-e63f2bb4f071',
        isFree: false,
        position: 9,
        type: 'book'
      },
      {
        identifier: '45e85577-da47-4fe3-a5c1-e4c8c37f8c7d',
        isFree: false,
        position: 10,
        type: 'book'
      }
    ],
    permissions: [],
    prices: [
      {
        currency: 'GBP',
        price: 1171.5,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: '2021-05-11T10:39:33.000Z'
      },
      {
        currency: 'USD',
        price: 1694,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: '2021-05-11T10:39:33.000Z'
      }
    ],
    rulesList: [
      {
        rules: [
          {
            name: 'availability',
            rules: [
              {
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                rule: {
                  attribute: 'availability.name',
                  relationship: 'EQ',
                  value: 'UBX'
                },
                type: 'criteria'
              },
              {
                rule: {
                  value: 'AND'
                },
                type: 'logical'
              },
              {
                rule: {
                  attribute: 'availability.status',
                  relationship: 'ALL',
                  values: ['SELLABLE']
                },
                type: 'criteria'
              },
              {
                rule: {
                  value: 'END'
                },
                type: 'separator'
              },
              {
                rule: {
                  value: 'END'
                },
                type: 'separator'
              }
            ],
            type: 'group'
          }
        ],
        rulesString:
          '{"availability":{"$elemMatch":{"$and":[{"name":{"$eq":"UBX"}},{"status":{"$all":["SELLABLE"]}}]}}}',
        type: 'book'
      }
    ],
    title: 'Women"s Travel Writing, 1750-1850',
    type: 'collection'
  },
  {
    _id: 'dcef3076-95d3-409a-8732-6985202b8f8b',
    _schemaVersion: '4.0.1',
    _source: {
      source: 'SALESFORCE',
      type: 'product'
    },
    associatedMedia: [
      {
        _id: '',
        location:
          'https://s3-euw1-ap-pe-df-pch-content-public-u.s3.eu-west-1.amazonaws.com/collection/dcef3076-95d3-409a-8732-6985202b8f8b/rhr-testrhr_bannerimage.jpg',
        size: 558826,
        type: 'bannerimage'
      },
      {
        location:
          'https://s3-euw1-ap-pe-df-pch-content-public-u.s3.eu-west-1.amazonaws.com/collection/dcef3076-95d3-409a-8732-6985202b8f8b/rhr-testrhr_coverimage.png',
        size: 375879,
        type: 'coverimage'
      }
    ],
    categories: [
      {
        code: '',
        name: 'collection-type',
        type: 'rhr sets'
      },
      {
        code: '',
        name: 'collection-update-type',
        type: 'static'
      }
    ],
    classifications: [],
    collection: {
      abstracts: [
        {
          type: 'text',
          value: 'cc'
        }
      ],
      autoRollover: false,
      channels: [
        {
          name: 'UBX',
          type: 'sales'
        },
        {
          name: 'UBX',
          type: 'delivery'
        }
      ],
      customers: [
        {
          name: 'Individual',
          type: 'customer'
        }
      ],
      description: 'cc',
      firstPublishedYear: 2021,
      licenses: [
        {
          name: 'Perpetual',
          type: 'license'
        }
      ],
      plannedPublicationDate: '2021-05-03T00:00:00.000Z',
      publisherImprint: '',
      status: 'planned',
      subjectAreaCode: 'HSS',
      subtitle: '',
      taxType: 'Q',
      validFrom: '2021-05-03T00:00:00.000Z'
    },
    identifiers: {
      collectionId: 'RHR-TESTRHR',
      doi: '',
      sku: '01t1q000005RiIwAAK'
    },
    partsAdded: [
      {
        identifier: '003921c4-81ff-4198-acc7-a0d220cc613b',
        isFree: false,
        position: 1,
        type: 'book'
      },
      {
        identifier: '0142c4e4-ef1e-4228-910b-efaad170a683',
        isFree: false,
        position: 2,
        type: 'book'
      }
    ],
    permissions: [],
    prices: [
      {
        currency: 'GBP',
        price: 270,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: '2021-05-07T10:45:51.000Z'
      },
      {
        currency: 'USD',
        price: 350,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: '2021-05-07T10:45:51.000Z'
      }
    ],
    rulesList: [
      {
        rules: [
          {
            name: 'availability',
            rules: [
              {
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                rule: {
                  attribute: 'availability.name',
                  relationship: 'EQ',
                  value: 'UBX'
                },
                type: 'criteria'
              },
              {
                rule: {
                  value: 'AND'
                },
                type: 'logical'
              },
              {
                rule: {
                  attribute: 'availability.status',
                  relationship: 'ALL',
                  values: ['SELLABLE']
                },
                type: 'criteria'
              },
              {
                rule: {
                  value: 'END'
                },
                type: 'separator'
              },
              {
                rule: {
                  value: 'END'
                },
                type: 'separator'
              }
            ],
            type: 'group'
          }
        ],
        rulesString:
          '{"availability":{"$elemMatch":{"$and":[{"name":{"$eq":"UBX"}},{"status":{"$all":["SELLABLE"]}}]}}}',
        type: 'book'
      }
    ],
    title: 'Test RHR sets',
    type: 'collection'
  },
  {
    _id: '2fb2f585-a86f-4dd1-8d24-f4157492d053',
    _schemaVersion: '4.0.1',
    _source: {
      source: 'SALESFORCE',
      type: 'product'
    },
    associatedMedia: [
      {
        _id: '',
        location:
          'https://s3-euw1-ap-pe-df-pch-content-public-u.s3.eu-west-1.amazonaws.com/collection/2fb2f585-a86f-4dd1-8d24-f4157492d053/hss-col-may_bannerimage.png',
        size: 252324,
        type: 'bannerimage'
      },
      {
        location:
          'https://s3-euw1-ap-pe-df-pch-content-public-u.s3.eu-west-1.amazonaws.com/collection/2fb2f585-a86f-4dd1-8d24-f4157492d053/hss-col-may_coverimage.png',
        size: 81034,
        type: 'coverimage'
      }
    ],
    categories: [
      {
        code: '',
        name: 'collection-type',
        type: 'hss'
      },
      {
        code: '',
        name: 'collection-update-type',
        type: 'dynamic'
      }
    ],
    classifications: [],
    collection: {
      abstracts: [
        {
          type: 'text',
          value: 'HSS Collection May1'
        }
      ],
      autoRollover: false,
      channels: [
        {
          name: 'UBX',
          type: 'delivery'
        }
      ],
      customers: [
        {
          name: 'Individual',
          type: 'customer'
        },
        {
          name: 'Institution',
          type: 'customer'
        },
        {
          name: 'Corporate',
          type: 'customer'
        },
        {
          name: 'Consortium',
          type: 'customer'
        },
        {
          name: 'Government',
          type: 'customer'
        }
      ],
      description: '',
      firstPublishedYear: 2021,
      licenses: [
        {
          name: 'Perpetual',
          type: 'license'
        },
        {
          name: 'Subscription',
          type: 'license'
        },
        {
          name: 'Rental',
          type: 'license'
        },
        {
          name: 'Evidence Based Selection',
          type: 'license'
        },
        {
          name: 'Trial',
          type: 'license'
        }
      ],
      plannedPublicationDate: '2021-05-01T00:00:00.000Z',
      publisherImprint: '',
      ruleUpdateEndDate: '2021-09-30T00:00:00.000Z',
      ruleUpdateStartDate: '2021-05-01T00:00:00.000Z',
      status: 'planned',
      subjectAreaCode: 'HSS',
      subtitle: '',
      taxType: 'Q',
      validFrom: '2021-05-01T00:00:00.000Z'
    },
    contributors: [
      {
        familyName: 'Collection',
        fullName: 'HSS Collection',
        givenName: 'HSS',
        position: 1,
        roles: ['Editor']
      }
    ],
    identifiers: {
      collectionId: 'HSS-COL-MAY',
      doi: '',
      sku: '01t1q000005R3kyAAC'
    },
    partsAdded: [],
    permissions: [],
    prices: [
      {
        currency: 'GBP',
        price: 25125.94,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: '2021-05-01T11:38:30.000Z'
      },
      {
        currency: 'USD',
        price: 36101.3,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: '2021-05-01T11:38:30.000Z'
      }
    ],
    rulesList: [
      {
        rules: [
          {
            name: 'product',
            rules: [
              {
                position: 1,
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                position: 2,
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                position: 3,
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                position: 4,
                rule: {
                  attribute: 'book.format',
                  relationship: 'IN',
                  values: ['e-Book']
                },
                type: 'criteria'
              },
              {
                position: 5,
                rule: {
                  value: 'END'
                },
                type: 'separator'
              },
              {
                position: 6,
                rule: {
                  value: 'AND'
                },
                type: 'logical'
              },
              {
                position: 7,
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                position: 8,
                rule: {
                  attribute: 'classifications.code',
                  relationship: 'IN',
                  values: ['SCBE052005', 'SCBE052010', 'SCBE052045']
                },
                type: 'criteria'
              },
              {
                position: 9,
                rule: {
                  value: 'END'
                },
                type: 'separator'
              },
              {
                position: 10,
                rule: {
                  value: 'AND'
                },
                type: 'logical'
              },
              {
                position: 11,
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                position: 12,
                rule: {
                  attribute: 'permissions.name',
                  relationship: 'NE',
                  value: 'drm'
                },
                type: 'criteria'
              },
              {
                position: 13,
                rule: {
                  value: 'END'
                },
                type: 'separator'
              },
              {
                position: 14,
                rule: {
                  value: 'END'
                },
                type: 'separator'
              },
              {
                position: 15,
                rule: {
                  value: 'END'
                },
                type: 'separator'
              }
            ],
            type: 'group'
          },
          {
            name: 'availability',
            rules: [
              {
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                rule: {
                  attribute: 'availability.name',
                  relationship: 'EQ',
                  value: 'UBX'
                },
                type: 'criteria'
              },
              {
                rule: {
                  value: 'AND'
                },
                type: 'logical'
              },
              {
                rule: {
                  attribute: 'availability.status',
                  relationship: 'ALL',
                  values: ['SELLABLE']
                },
                type: 'criteria'
              },
              {
                rule: {
                  value: 'END'
                },
                type: 'separator'
              },
              {
                rule: {
                  value: 'END'
                },
                type: 'separator'
              }
            ],
            type: 'group'
          }
        ],
        rulesString:
          '{"$and":[{"$and":[{"book.format":{"$in":["e-Book"]}},{"classifications.code":{"$in":["SCBE052005","SCBE052010","SCBE052045"]}},{"permissions.name":{"$ne":"drm"}}]},{"availability":{"$elemMatch":{"$and":[{"name":{"$eq":"UBX"}},{"status":{"$all":["SELLABLE"]}}]}}}]}',
        type: 'book'
      }
    ],
    title: 'HSS Collection May1',
    type: 'collection'
  },
  {
    _id: '34b5ea61-fbba-42a9-a9ec-bf77507847f4',
    _schemaVersion: '4.0.1',
    _source: {
      source: 'SALESFORCE',
      type: 'product'
    },
    associatedMedia: [
      {
        _id: '',
        location:
          'https://s3-euw1-ap-pe-df-pch-content-public-u.s3.eu-west-1.amazonaws.com/collection/34b5ea61-fbba-42a9-a9ec-bf77507847f4/hss-as-med-1_bannerimage.png',
        size: 380195,
        type: 'bannerimage'
      },
      {
        location:
          'https://s3-euw1-ap-pe-df-pch-content-public-u.s3.eu-west-1.amazonaws.com/collection/34b5ea61-fbba-42a9-a9ec-bf77507847f4/hss-as-med-1_coverimage.png',
        size: 115827,
        type: 'coverimage'
      }
    ],
    categories: [
      {
        code: '',
        name: 'collection-type',
        type: 'hss'
      },
      {
        code: '',
        name: 'collection-update-type',
        type: 'dynamic'
      }
    ],
    classifications: [
      {
        code: 'SCBE052045',
        group: '',
        name: '',
        type: 'subject'
      }
    ],
    collection: {
      abstracts: [
        {
          type: 'text',
          value: 'AssoMediaTest 1 - CMS - update'
        }
      ],
      autoRollover: false,
      channels: [
        {
          name: 'UBX',
          type: 'delivery'
        }
      ],
      customers: [
        {
          name: 'Individual',
          type: 'customer'
        },
        {
          name: 'Institution',
          type: 'customer'
        },
        {
          name: 'Corporate',
          type: 'customer'
        },
        {
          name: 'Consortium',
          type: 'customer'
        },
        {
          name: 'Government',
          type: 'customer'
        }
      ],
      description: '',
      firstPublishedYear: 2021,
      licenses: [
        {
          name: 'Perpetual',
          type: 'license'
        },
        {
          name: 'Subscription',
          type: 'license'
        },
        {
          name: 'Rental',
          type: 'license'
        },
        {
          name: 'Evidence Based Selection',
          type: 'license'
        },
        {
          name: 'Trial',
          type: 'license'
        }
      ],
      plannedPublicationDate: '2021-04-26T00:00:00.000Z',
      publisherImprint: '',
      ruleUpdateEndDate: '2021-07-31T00:00:00.000Z',
      ruleUpdateStartDate: '2021-04-26T00:00:00.000Z',
      status: 'planned',
      subjectAreaCode: 'HSS',
      subtitle: '',
      taxType: 'Q',
      validFrom: '2021-04-26T00:00:00.000Z'
    },
    contributors: [
      {
        familyName: 'Name',
        fullName: 'Test Name',
        givenName: 'Test',
        position: 1,
        roles: ['Editor']
      }
    ],
    identifiers: {
      collectionId: 'HSS-AS-MED-1',
      doi: '',
      sku: '01t1q000005R3ktAAC'
    },
    keywords: [
      {
        name: 'Media',
        position: 1,
        type: 'catchword'
      }
    ],
    partsUpdated: [],
    permissions: [],
    prices: [
      {
        currency: 'GBP',
        price: 24580.94,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: '2021-05-01T11:21:55.000Z'
      },
      {
        currency: 'USD',
        price: 35316.3,
        priceType: 'BYO Library Price',
        priceTypeCode: 'BYO',
        validFrom: '2021-05-01T11:21:55.000Z'
      }
    ],
    rulesList: [
      {
        rules: [
          {
            name: 'product',
            rules: [
              {
                position: 1,
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                position: 2,
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                position: 3,
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                position: 4,
                rule: {
                  attribute: 'book.format',
                  relationship: 'IN',
                  values: ['e-Book']
                },
                type: 'criteria'
              },
              {
                position: 5,
                rule: {
                  value: 'END'
                },
                type: 'separator'
              },
              {
                position: 6,
                rule: {
                  value: 'AND'
                },
                type: 'logical'
              },
              {
                position: 7,
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                position: 8,
                rule: {
                  attribute: 'classifications.code',
                  relationship: 'IN',
                  values: ['SCBE052005', 'SCBE052010', 'SCBE052045']
                },
                type: 'criteria'
              },
              {
                position: 9,
                rule: {
                  value: 'END'
                },
                type: 'separator'
              },
              {
                position: 10,
                rule: {
                  value: 'AND'
                },
                type: 'logical'
              },
              {
                position: 11,
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                position: 12,
                rule: {
                  attribute: 'permissions.name',
                  relationship: 'NE',
                  value: 'drm'
                },
                type: 'criteria'
              },
              {
                position: 13,
                rule: {
                  value: 'END'
                },
                type: 'separator'
              },
              {
                position: 14,
                rule: {
                  value: 'END'
                },
                type: 'separator'
              },
              {
                position: 15,
                rule: {
                  value: 'END'
                },
                type: 'separator'
              }
            ],
            type: 'group'
          },
          {
            name: 'availability',
            rules: [
              {
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                rule: {
                  value: 'BEGIN'
                },
                type: 'separator'
              },
              {
                rule: {
                  attribute: 'availability.name',
                  relationship: 'EQ',
                  value: 'UBX'
                },
                type: 'criteria'
              },
              {
                rule: {
                  value: 'AND'
                },
                type: 'logical'
              },
              {
                rule: {
                  attribute: 'availability.status',
                  relationship: 'ALL',
                  values: ['SELLABLE']
                },
                type: 'criteria'
              },
              {
                rule: {
                  value: 'END'
                },
                type: 'separator'
              },
              {
                rule: {
                  value: 'END'
                },
                type: 'separator'
              }
            ],
            type: 'group'
          }
        ],
        rulesString:
          '{"$and":[{"$and":[{"book.format":{"$in":["e-Book"]}},{"classifications.code":{"$in":["SCBE052005","SCBE052010","SCBE052045"]}},{"permissions.name":{"$ne":"drm"}}]},{"availability":{"$elemMatch":{"$and":[{"name":{"$eq":"UBX"}},{"status":{"$all":["SELLABLE"]}}]}}}]}',
        type: 'book'
      }
    ],
    title: 'AssoMediaTest 1',
    type: 'collection'
  }
] as any;
