"use strict";
/**
 * Add all the common properties here.
 * You still can override these properties at each ENV properties config.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.configProperties = exports.commonConfigProperties = void 0;
exports.commonConfigProperties = {
    defaultAwsRegion: 'eu-west-1',
    defaultBatchSize: 50,
    defaultBatchSizeV4: 30,
    expandedAPIDefaultBatchSize: 10,
    expandedAPIMaxBatchSize: 100,
    googleBotOrganizationName: 'Google Scholar Bot',
    logPath: '/logs/pcm-api',
    maxBatchSizeV4: 50,
    partsAPIMaxBatchSizeV4: 500,
    requestBodySizeLimit: 1 * 1024 * 1024,
    searchAPIMaxBatchSizeV4: 1000,
    searchCacheBatchSize: 100,
    // Bytes : 1MB
    secretRegion: 'eu-west-1'
};
/**
 * Configuration for: DEV
 * You can override Common-Config-Properties here.
 * Note: We are using Object.assign which will re-assign the root level properties only.
 */
var devConfigProperties = {
    ESUrl: 'https://vpc-es-use1-df-pcm-search-d-ae4elw6idwbfslzz64acxa4q3e.us-east-1.es.amazonaws.com',
    authUrl: 'https://api-dev.taylorfrancis.com/v2/auth',
    cdnSecretUbx: 'sm/euw1/appe/df/pch/cloudfront/pcm-cdn-ubx/d',
    cloudfrontDomainName: 'https://d1m1ankjn636t7.cloudfront.net',
    cloudfrontKeypairId: 'KKN8MM7OPZIMQ',
    cloudfrontSecretName: 'sm/euw1/appe/df/pch/cloudfront/pcm-cdn/d',
    collectionFIFOQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-collections-in-d.fifo'
    },
    contentApiUrl: 'https://api-dev.taylorfrancis.com/v4/content',
    contentReadUserSecretName: 'sm/euw1/appe/df/pch/api/content-read-user/d',
    contentS3Bucket: 's3-euw1-ap-pe-df-pch-content-store-d',
    creativeWorkFIFOQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-availability-in-d.fifo'
    },
    dbSecretName: 'sm/euw1/appe/df/pch/api/db/d',
    // Note: Keep all the keys in lowercase Do not use camelcase
    docTypeToCollectionMapperV4: {
        asset: 'assets-4.0.1',
        associatedmedia: 'associatedmedia-4.0.1',
        book: 'books-4.0.1',
        chapter: 'chapters-4.0.1',
        citation: 'citations-4.0.1',
        collection: 'collections-4.0.1',
        collectionrevision: 'collection-revisions',
        creativework: 'creativework-4.0.1',
        entry: 'entry-4.0.1',
        entryversion: 'entry-version-4.0.1',
        journal: 'journals-4.0.1',
        journalpublishingservicemap: 'journalPublishingServiceMap-4.0.1',
        manuscriptworkflow: 'manuscript-workflow',
        part: 'parts-4.0.1',
        partrevision: 'parts-revisions-4.0.1',
        prearticle: 'pre-articles-4.0.1',
        prechapter: 'pre-chapters-4.0.1',
        publishingservice: 'publishingServices-4.0.1',
        scholarlyarticle: 'articles-4.0.1',
        series: 'series-4.0.1',
        set: 'set-4.0.1',
        taxonomy: 'taxonomy-4.0.1',
        taxonomyMaster: 'taxonomy-master'
    },
    docTypeToCollectionMapping: {
        articles: 'articles2',
        asset: 'assets',
        assets: 'assets',
        book: 'books',
        chapter: 'chapters',
        citation: 'citations',
        collection: 'collections',
        collections: 'collections',
        creativework: 'curated-content',
        'curated-content': 'curated-content',
        part: 'parts',
        scholarlyarticle: 'articles2',
        set: 'set',
        title: 'titles'
    },
    docTypeToESIndexMapperV4: {
        bookIndex: 'books-dev-searching-alias',
        chapterIndex: 'chapters-dev-searching-alias',
        collectionIndex: 'collections-dev-searching-alias',
        creativeWorkIndex: 'creativework-dev-searching-alias',
        'entry-versionIndex': 'entryversion-dev-searching-alias',
        entryIndex: 'entry-dev-searching-alias',
        entryVersionIndex: 'entryversion-dev-searching-alias',
        scholarlyArticleIndex: 'articles-dev-searching-alias'
    },
    entitlementUrl: 'http://entitlement-management-service-dev.us-east-1.elasticbeanstalk.com/entitlements/grantTypes',
    envName: 'dev',
    eventStoreBucket: 's3-euw1-ap-pe-df-pch-events-store-d',
    featureToggles: {},
    hubDBSecretName: 'sm/euw1/appe/df/pch/pipeline/db/d',
    hubDbHost: 'clu-df-pch-hub-dev-uat.iken9.mongodb.net/product-content-validation-store-d',
    iamEnv: 'dev',
    journalProductEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-adaptor-journals-salesforce-in-d.fifo'
    },
    journalPublishingServiceMapEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-adaptor-publishing-service-association-mapping-in-d.fifo'
    },
    oaUpdateQueue: {
        isFifoQueue: false,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-adaptor-oa-ingest-in-d'
    },
    pcmAppSecretName: 'sm/euw1/appe/df/pch/api/pcm-app/d',
    preChapterProductEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-pre-chapter-adaptor-in-d.fifo'
    },
    productAckEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-asset-logging-in-d.fifo'
    },
    propertiesAPIUrl: 'http://properties-api-prod.us-east-1.elasticbeanstalk.com/properties/CP_PARTIES/dev',
    publishingServiceProductEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-adaptor-publishing-service-in-d.fifo'
    },
    searchResultDownloadQueue: {
        isFifoQueue: false,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-search-result-out-d'
    },
    storeDbHost: 'clu-df-pch-product-stor.iken9.mongodb.net/product-store-dev',
    storeDbHostJumpServer: 'clu-df-pch-product-stor.iken9.mongodb.net/product-store-dev',
    ubxWebsUrl: 'https://dev.taylorfrancis.com'
};
/**
 * Configuration for: UAT
 * You can override Common-Config-Properties here.
 * Note: We are using Object.assign which will re-assign the root level properties only.
 */
var uatConfigProperties = {
    ESUrl: 'https://vpc-es-use1-df-pcm-search-d-ae4elw6idwbfslzz64acxa4q3e.us-east-1.es.amazonaws.com',
    authUrl: 'https://api-uat.taylorfrancis.com/v2/auth',
    cdnSecretUbx: 'sm/euw1/appe/df/pch/cloudfront/pcm-cdn-ubx/u',
    cloudfrontDomainName: 'https://d3epn2tl5km3pn.cloudfront.net',
    cloudfrontKeypairId: 'K1XPOGNZE3HZLQ',
    cloudfrontSecretName: 'sm/euw1/appe/df/pch/cloudfront/pcm-cdn/u',
    collectionFIFOQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-collections-in-u.fifo'
    },
    contentApiUrl: 'https://api-uat.taylorfrancis.com/v4/content',
    contentReadUserSecretName: 'sm/euw1/appe/df/pch/api/content-read-user/u',
    contentS3Bucket: 's3-euw1-ap-pe-df-pch-content-store-u',
    creativeWorkFIFOQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-availability-in-u.fifo'
    },
    dbSecretName: 'sm/euw1/appe/df/pch/api/db/u',
    // Note: Keep all the keys in lowercase Do not use camelcase
    docTypeToCollectionMapperV4: {
        asset: 'assets-4.0.1',
        associatedmedia: 'associatedmedia-4.0.1',
        book: 'books-4.0.1',
        chapter: 'chapters-4.0.1',
        citation: 'citations-4.0.1',
        collection: 'collections-4.0.1',
        collectionrevision: 'collection-revisions',
        creativework: 'creativework-4.0.1',
        entry: 'entry-4.0.1',
        entryversion: 'entry-version-4.0.1',
        journal: 'journals-4.0.1',
        journalpublishingservicemap: 'journalPublishingServiceMap-4.0.1',
        manuscriptworkflow: 'manuscript-workflow',
        part: 'parts-4.0.1',
        partrevision: 'parts-revisions-4.0.1',
        prearticle: 'pre-articles-4.0.1',
        prechapter: 'pre-chapters-4.0.1',
        publishingservice: 'publishingServices-4.0.1',
        scholarlyarticle: 'articles-4.0.1',
        series: 'series-4.0.1',
        set: 'set-4.0.1',
        taxonomy: 'taxonomy-4.0.1',
        taxonomyMaster: 'taxonomy-master'
    },
    docTypeToCollectionMapping: {
        articles: 'articles2',
        asset: 'assets',
        assets: 'assets',
        book: 'books',
        chapter: 'chapters',
        citation: 'citations',
        collection: 'collections',
        collections: 'collections',
        creativework: 'curated-content',
        'curated-content': 'curated-content',
        part: 'parts',
        scholarlyarticle: 'articles2',
        set: 'set',
        title: 'titles'
    },
    docTypeToESIndexMapperV4: {
        bookIndex: 'books-uat-searching-alias',
        chapterIndex: 'chapters-uat-searching-alias',
        collectionIndex: 'collections-uat-searching-alias',
        creativeWorkIndex: 'creativework-uat-searching-alias',
        'entry-versionIndex': 'entryversion-uat-searching-alias',
        entryIndex: 'entry-uat-searching-alias',
        entryVersionIndex: 'entryversion-uat-searching-alias',
        scholarlyArticleIndex: 'articles-uat-searching-alias'
    },
    entitlementUrl: 'http://entitlementmanagementservice-nlb.fkq72acfuz.us-east-1.elasticbeanstalk.com/entitlements/grantTypes',
    entitlementUrlV4: 'http://nlb-use1-ap-pe-ems-fat-api-u-98a3de22d27b61ac.elb.us-east-1.amazonaws.com/entitlements/all?productIds=',
    envName: 'uat',
    eventStoreBucket: 's3-euw1-ap-pe-df-pch-events-store-u',
    featureToggles: {},
    hubDBSecretName: 'sm/euw1/appe/df/pch/pipeline/db/u',
    hubDbHost: 'clu-df-pch-hub-dev-uat.iken9.mongodb.net/product-content-validation-store-u',
    iamEnv: 'uat',
    journalProductEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-adaptor-journals-salesforce-in-u.fifo'
    },
    journalPublishingServiceMapEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-adaptor-publishing-service-association-mapping-in-u.fifo'
    },
    oaUpdateQueue: {
        isFifoQueue: false,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-adaptor-oa-ingest-in-u'
    },
    pcmAppSecretName: 'sm/euw1/appe/df/pch/api/pcm-app/u',
    preChapterProductEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-pre-chapter-adaptor-in-u.fifo'
    },
    productAckEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-asset-logging-in-u.fifo'
    },
    propertiesAPIUrl: 'http://properties-api-prod.us-east-1.elasticbeanstalk.com/properties/CP_PARTIES/uat',
    publishingServiceProductEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-adaptor-publishing-service-in-u.fifo'
    },
    searchResultDownloadQueue: {
        isFifoQueue: false,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-search-result-out-u'
    },
    storeDbHost: 'clu-df-pch-product-stor.iken9.mongodb.net/product-store-uat',
    storeDbHostJumpServer: 'clu-df-pch-product-stor.iken9.mongodb.net/product-store-uat',
    ubxWebsUrl: 'https://uat.taylorfrancis.com'
};
/**
 * Configuration for: PROD
 * You can override Common-Config-Properties here.
 * Note: We are using Object.assign which will re-assign the root level properties only.
 */
var prodConfigProperties = {
    ESUrl: 'https://vpc-es-use1-df-pcm-search-p-ywzvufapmozat74ofnxn5y4hni.us-east-1.es.amazonaws.com',
    authUrl: 'https://api.taylorfrancis.com/v2/auth',
    cdnSecretUbx: 'sm/euw1/appe/df/pch/cloudfront/pcm-cdn-ubx/p',
    cloudfrontDomainName: 'https://d1nkx8s8fvzxfi.cloudfront.net',
    cloudfrontKeypairId: 'K2QLAZ4RGXZISE',
    cloudfrontSecretName: 'sm/euw1/appe/df/pch/cloudfront/pcm-cdn/p',
    collectionFIFOQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-collections-in-p.fifo'
    },
    contentApiUrl: 'https://api.taylorfrancis.com/v4/content',
    contentReadUserSecretName: 'sm/euw1/appe/df/pch/api/content-read-user/p',
    contentS3Bucket: 's3-euw1-ap-pe-df-pch-content-store-p',
    creativeWorkFIFOQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-availability-in-p.fifo'
    },
    dbSecretName: 'sm/euw1/appe/df/pch/api/db/p',
    // Note: Keep all the keys in lowercase Do not use camelcase
    docTypeToCollectionMapperV4: {
        asset: 'assets-4.0.1',
        associatedmedia: 'associatedmedia-4.0.1',
        book: 'books-4.0.1',
        chapter: 'chapters-4.0.1',
        citation: 'citations-4.0.1',
        collection: 'collections-4.0.1',
        collectionrevision: 'collection-revisions',
        creativework: 'creativework-4.0.1',
        entry: 'entry-4.0.1',
        entryversion: 'entry-version-4.0.1',
        journal: 'journals-4.0.1',
        journalpublishingservicemap: 'journalPublishingServiceMap-4.0.1',
        manuscriptworkflow: 'manuscript-workflow',
        part: 'parts-4.0.1',
        partrevision: 'parts-revisions-4.0.1',
        prearticle: 'pre-articles-4.0.1',
        prechapter: 'pre-chapters-4.0.1',
        publishingservice: 'publishingServices-4.0.1',
        scholarlyarticle: 'articles-4.0.1',
        series: 'series-4.0.1',
        set: 'set-4.0.1',
        taxonomy: 'taxonomy-4.0.1',
        taxonomyMaster: 'taxonomy-master'
    },
    docTypeToCollectionMapping: {
        articles: 'articles2',
        asset: 'assets',
        assets: 'assets',
        book: 'books',
        chapter: 'chapters',
        citation: 'citations',
        collection: 'collections',
        collections: 'collections',
        creativework: 'curated-content',
        'curated-content': 'curated-content',
        part: 'parts',
        scholarlyarticle: 'articles2',
        set: 'set',
        title: 'titles'
    },
    docTypeToESIndexMapperV4: {
        bookIndex: 'books-prod-searching-alias',
        chapterIndex: 'chapters-prod-searching-alias',
        collectionIndex: 'collections-prod-searching-alias',
        creativeWorkIndex: 'creativework-prod-searching-alias',
        'entry-versionIndex': 'entryversion-prod-searching-alias',
        entryIndex: 'entry-prod-searching-alias',
        entryVersionIndex: 'entryversion-prod-searching-alias',
        scholarlyArticleIndex: 'articles-prod-searching-alias'
    },
    entitlementUrl: 'http://entitlement-management-service-prod-blue.us-east-1.elasticbeanstalk.com/entitlements/grantTypes',
    entitlementUrlV4: 'http://entitlements-fat-api-ubx2-prod.us-east-1.elasticbeanstalk.com/entitlements/all?productIds=',
    envName: 'prod',
    eventStoreBucket: 's3-euw1-ap-pe-df-pch-events-store-p',
    featureToggles: {},
    hubDBSecretName: 'sm/euw1/appe/df/pch/pipeline/db/p',
    hubDbHost: 'clu-df-pch-hub-prod.kiz5p.mongodb.net/product-content-validation-store-p',
    iamEnv: 'prod',
    journalProductEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-adaptor-journals-salesforce-in-p.fifo'
    },
    journalPublishingServiceMapEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-adaptor-publishing-service-association-mapping-in-p.fifo'
    },
    oaUpdateQueue: {
        isFifoQueue: false,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-adaptor-oa-ingest-in-p'
    },
    pcmAppSecretName: 'sm/euw1/appe/df/pch/api/pcm-app/p',
    preChapterProductEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-pre-chapter-adaptor-in-p.fifo'
    },
    productAckEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-asset-logging-in-p.fifo'
    },
    propertiesAPIUrl: 'http://properties-api-prod.us-east-1.elasticbeanstalk.com/properties/CP_PARTIES/prod',
    publishingServiceProductEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-adaptor-publishing-service-in-p.fifo'
    },
    searchResultDownloadQueue: {
        isFifoQueue: false,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-search-result-out-p'
    },
    storeDbHost: 'clu-df-pch-store-prod.kiz5p.mongodb.net/product-store-p',
    storeDbHostJumpServer: 'clu-df-pch-store-prod.kiz5p.mongodb.net/product-store-p',
    ubxWebsUrl: 'https://www.taylorfrancis.com'
};
/**
 * Configuration for: LOCAL
 * You can override Common-Config-Properties here.
 * Note: We are using Object.assign which will re-assign the root level properties only.
 */
var localConfigProperties = {
    ESUrl: 'https://vpc-es-use1-df-pcm-search-d-ae4elw6idwbfslzz64acxa4q3e.us-east-1.es.amazonaws.com',
    authUrl: 'https://api-dev.taylorfrancis.com/v2/auth',
    cdnSecretUbx: 'sm/euw1/appe/df/pch/cloudfront/pcm-cdn-ubx/d',
    cloudfrontDomainName: 'https://d1m1ankjn636t7.cloudfront.net',
    cloudfrontKeypairId: 'KKN8MM7OPZIMQ',
    cloudfrontSecretName: 'sm/euw1/appe/df/pch/cloudfront/pcm-cdn/d',
    collectionFIFOQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-collections-in-d.fifo'
    },
    contentApiUrl: 'https://api-dev.taylorfrancis.com/v4/content',
    contentReadUserSecretName: 'sm/euw1/appe/df/pch/api/content-read-user/d',
    contentS3Bucket: 's3-euw1-ap-pe-df-pch-content-store-d',
    creativeWorkFIFOQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-availability-in-d.fifo'
    },
    dbSecretName: 'sm/euw1/appe/df/pch/api/db/d',
    // Note: Keep all the keys in lowercase Do not use camelcase
    docTypeToCollectionMapperV4: {
        asset: 'assets-4.0.1',
        associatedmedia: 'associatedmedia-4.0.1',
        book: 'books-4.0.1',
        chapter: 'chapters-4.0.1',
        citation: 'citations-4.0.1',
        collection: 'collections-4.0.1',
        collectionrevision: 'collection-revisions',
        creativework: 'creativework-4.0.1',
        entry: 'entry-4.0.1',
        entryversion: 'entry-version-4.0.1',
        journal: 'journals-4.0.1',
        journalpublishingservicemap: 'journalPublishingServiceMap-4.0.1',
        manuscriptworkflow: 'manuscript-workflow',
        part: 'parts-4.0.1',
        partrevision: 'parts-revisions-4.0.1',
        prearticle: 'pre-articles-4.0.1',
        prechapter: 'pre-chapters-4.0.1',
        publishingservice: 'publishingServices-4.0.1',
        scholarlyarticle: 'articles-4.0.1',
        series: 'series-4.0.1',
        set: 'set-4.0.1',
        taxonomy: 'taxonomy-4.0.1',
        taxonomyMaster: 'taxonomy-master'
    },
    docTypeToCollectionMapping: {
        articles: 'articles2',
        asset: 'assets',
        assets: 'assets',
        book: 'books',
        chapter: 'chapters',
        citation: 'citations',
        collection: 'collections',
        collections: 'collections',
        creativework: 'curated-content',
        'curated-content': 'curated-content',
        part: 'parts',
        scholarlyarticle: 'articles2',
        set: 'set',
        title: 'titles'
    },
    docTypeToESIndexMapperV4: {
        bookIndex: 'books-uat-searching-alias',
        chapterIndex: 'chapters-uat-searching-alias',
        collectionIndex: 'collections-uat-searching-alias',
        creativeWorkIndex: 'creativework-uat-searching-alias',
        'entry-versionIndex': 'entryversion-uat-searching-alias',
        entryIndex: 'entry-uat-searching-alias',
        entryVersionIndex: 'entryversion-uat-searching-alias',
        scholarlyArticleIndex: 'articles-uat-searching-alias'
    },
    entitlementUrl: 'http://entitlementmanagementservice-nlb.fkq72acfuz.us-east-1.elasticbeanstalk.com/entitlements/grantTypes',
    envName: 'local',
    eventStoreBucket: 's3-euw1-ap-pe-df-pch-events-store-d',
    featureToggles: {},
    hubDBSecretName: 'sm/euw1/appe/df/pch/pipeline/db/d',
    hubDbHost: 'localhost:27017/product-content-validation-store-l',
    iamEnv: 'dev',
    journalProductEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-adaptor-journals-salesforce-in-l.fifo'
    },
    journalPublishingServiceMapEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-adaptor-publishing-service-association-mapping-in-l.fifo'
    },
    pcmAppSecretName: 'sm/euw1/appe/df/pch/api/pcm-app/d',
    preChapterProductEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-pre-chapter-adaptor-in-l.fifo'
    },
    productAckEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-asset-logging-in-d.fifo'
    },
    propertiesAPIUrl: 'http://properties-api-prod.us-east-1.elasticbeanstalk.com/properties/CP_PARTIES/dev',
    publishingServiceProductEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-adaptor-publishing-service-in-l.fifo'
    },
    searchResultDownloadQueue: {
        isFifoQueue: false,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/my-queue'
    },
    storeDbHost: 'localhost:27017/product-store-local',
    storeDbHostJumpServer: 'localhost:27017/product-store-local',
    ubxWebsUrl: 'https://dev.taylorfrancis.com'
};
/**
 * Configuration for: QA
 * You can override Common-Config-Properties here.
 * Note: We are using Object.assign which will re-assign the root level properties only.
 */
var qaConfigProperties = {
    ESUrl: 'https://vpc-es-use1-df-pcm-search-d-ae4elw6idwbfslzz64acxa4q3e.us-east-1.es.amazonaws.com',
    authUrl: 'https://api-uat.taylorfrancis.com/v2/auth',
    cdnSecretUbx: 'sm/euw1/appe/df/pch/cloudfront/pcm-cdn-ubx/u',
    cloudfrontDomainName: 'https://d3epn2tl5km3pn.cloudfront.net',
    cloudfrontKeypairId: 'K1XPOGNZE3HZLQ',
    cloudfrontSecretName: 'sm/euw1/appe/df/pch/cloudfront/pcm-cdn/u',
    collectionFIFOQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-collections-in-q.fifo'
    },
    contentApiUrl: 'https://api-uat.taylorfrancis.com/v4/content',
    contentReadUserSecretName: 'sm/euw1/appe/df/pch/api/content-read-user/q',
    contentS3Bucket: 's3-euw1-ap-pe-df-pch-content-store-q',
    creativeWorkFIFOQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-availability-in-q.fifo'
    },
    dbSecretName: 'sm/euw1/appe/df/pch/api/db/q',
    // Note: Keep all the keys in lowercase Do not use camelcase
    docTypeToCollectionMapperV4: {
        asset: 'assets-4.0.1',
        associatedmedia: 'associatedmedia-4.0.1',
        book: 'books-4.0.1',
        chapter: 'chapters-4.0.1',
        citation: 'citations-4.0.1',
        collection: 'collections-4.0.1',
        collectionrevision: 'collection-revisions',
        creativework: 'creativework-4.0.1',
        entry: 'entry-4.0.1',
        entryversion: 'entry-version-4.0.1',
        journal: 'journals-4.0.1',
        journalpublishingservicemap: 'journalPublishingServiceMap-4.0.1',
        manuscriptworkflow: 'manuscript-workflow',
        part: 'parts-4.0.1',
        partrevision: 'parts-revisions-4.0.1',
        prearticle: 'pre-articles-4.0.1',
        prechapter: 'pre-chapters-4.0.1',
        publishingservice: 'publishingServices-4.0.1',
        scholarlyarticle: 'articles-4.0.1',
        series: 'series-4.0.1',
        set: 'set-4.0.1',
        taxonomy: 'taxonomy-4.0.1',
        taxonomyMaster: 'taxonomy-master'
    },
    docTypeToCollectionMapping: {
        articles: 'articles2',
        asset: 'assets',
        assets: 'assets',
        book: 'books',
        chapter: 'chapters',
        citation: 'citations',
        collection: 'collections',
        collections: 'collections',
        creativework: 'curated-content',
        'curated-content': 'curated-content',
        part: 'parts',
        scholarlyarticle: 'articles2',
        set: 'set',
        title: 'titles'
    },
    docTypeToESIndexMapperV4: {
        bookIndex: 'books-qa-searching-alias',
        chapterIndex: 'chapters-qa-searching-alias',
        collectionIndex: 'collections-qa-searching-alias',
        creativeWorkIndex: 'creativework-qa-searching-alias',
        'entry-versionIndex': 'entryversion-qa-searching-alias',
        entryIndex: 'entry-qa-searching-alias',
        entryVersionIndex: 'entryversion-qa-searching-alias',
        scholarlyArticleIndex: 'articles-qa-searching-alias'
    },
    entitlementUrl: 'http://entitlementmanagementservice-nlb.fkq72acfuz.us-east-1.elasticbeanstalk.com/entitlements/grantTypes',
    entitlementUrlV4: 'http://nlb-use1-ap-pe-ems-fat-api-u-98a3de22d27b61ac.elb.us-east-1.amazonaws.com/entitlements/all?productIds=',
    envName: 'qa',
    eventStoreBucket: 's3-euw1-ap-pe-df-pch-events-store-q',
    featureToggles: {},
    hubDBSecretName: 'sm/euw1/appe/df/pch/pipeline/db/q',
    hubDbHost: 'clu-df-pch-hub-dev-uat.iken9.mongodb.net/product-content-validation-store-q',
    iamEnv: 'uat',
    journalProductEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-adaptor-journals-salesforce-in-q.fifo'
    },
    journalPublishingServiceMapEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-adaptor-publishing-service-association-mapping-in-q.fifo'
    },
    pcmAppSecretName: 'sm/euw1/appe/df/pch/api/pcm-app/q',
    preChapterProductEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-pre-chapter-adaptor-in-q.fifo'
    },
    productAckEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-asset-logging-in-q.fifo'
    },
    propertiesAPIUrl: 'http://properties-api-prod.us-east-1.elasticbeanstalk.com/properties/CP_PARTIES/uat',
    publishingServiceProductEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-adaptor-publishing-service-in-q.fifo'
    },
    searchResultDownloadQueue: {
        isFifoQueue: false,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-search-result-out-q'
    },
    storeDbHost: 'clu-df-pch-product-stor.iken9.mongodb.net/product-store-qa',
    storeDbHostJumpServer: 'clu-df-pch-product-stor.iken9.mongodb.net/product-store-qa',
    ubxWebsUrl: 'https://uat.taylorfrancis.com'
};
/**
 * Configuration for: TEST
 * You can override Common-Config-Properties here.
 * Note: We are using Object.assign which will re-assign the root level properties only.
 */
var testConfigProperties = {
    ESUrl: 'https://vpc-es-use1-df-pcm-search-d-ae4elw6idwbfslzz64acxa4q3e.us-east-1.es.amazonaws.com',
    authUrl: '',
    cdnSecretUbx: '',
    cloudfrontDomainName: 'https://d2febwnvvmit8b.cloudfront.net',
    cloudfrontKeypairId: 'KH70TIQIMYYDN',
    cloudfrontSecretName: 'sm/euw1/appe/df/pch/cloudfront/pcm-cdn/d',
    contentApiUrl: 'https://api-dev.taylorfrancis.com/v4/content',
    contentReadUserSecretName: '',
    dbSecretName: '',
    // Note: Keep all the keys in lowercase Do not use camelcase
    docTypeToCollectionMapperV4: {
        asset: 'assets-4.0.1',
        associatedmedia: 'associatedmedia-4.0.1',
        book: 'books-4.0.1',
        chapter: 'chapters-4.0.1',
        citation: 'citations-4.0.1',
        collection: 'collections-4.0.1',
        collectionrevision: 'collection-revisions',
        creativework: 'creativework-4.0.1',
        entry: 'entry-4.0.1',
        entryversion: 'entry-version-4.0.1',
        journal: 'journals-4.0.1',
        journalpublishingservicemap: 'journalPublishingServiceMap-4.0.1',
        manuscriptworkflow: 'manuscript-workflow',
        part: 'parts-4.0.1',
        partrevision: 'parts-revisions-4.0.1',
        prearticle: 'pre-articles-4.0.1',
        prechapter: 'pre-chapters-4.0.1',
        publishingservice: 'publishingServices-4.0.1',
        scholarlyarticle: 'articles-4.0.1',
        series: 'series-4.0.1',
        set: 'set-4.0.1',
        taxonomy: 'taxonomy-4.0.1',
        taxonomyMaster: 'taxonomy-master'
    },
    docTypeToCollectionMapping: {
        articles: 'articles2',
        asset: 'assets',
        assets: 'assets',
        book: 'books',
        chapter: 'chapters',
        citation: 'citations',
        collection: 'collections',
        collections: 'collections',
        creativework: 'curated-content',
        'curated-content': 'curated-content',
        part: 'parts',
        scholarlyarticle: 'articles2',
        set: 'set',
        title: 'titles'
    },
    docTypeToESIndexMapperV4: {
        bookIndex: 'books-dev-searching-alias',
        chapterIndex: 'chapters-dev-searching-alias',
        collectionIndex: 'collections-dev-searching-alias',
        creativeWorkIndex: 'creativework-dev-searching-alias',
        'entry-versionIndex': 'entryversion-dev-searching-alias',
        entryIndex: 'entry-dev-searching-alias',
        entryVersionIndex: 'entryversion-dev-searching-alias',
        scholarlyArticleIndex: 'articles-dev-searching-alias'
    },
    entitlementUrlV4: 'http://entitlements-fat-api-ubx2-prod.us-east-1.elasticbeanstalk.com/entitlements/all?productIds=',
    envName: 'test',
    eventStoreBucket: '',
    featureToggles: {},
    hubDBSecretName: '',
    hubDbHost: '',
    iamEnv: 'dev',
    journalProductEventQueue: {
        isFifoQueue: true,
        url: ''
    },
    journalPublishingServiceMapEventQueue: {
        isFifoQueue: true,
        url: ''
    },
    pcmAppSecretName: '',
    productAckEventQueue: {
        isFifoQueue: true,
        url: 'https://sqs.eu-west-1.amazonaws.com/012177264511/sqs-euw1-ap-pe-df-pch-asset-logging-in-t.fifo'
    },
    propertiesAPIUrl: 'http://properties-api-prod.us-east-1.elasticbeanstalk.com/properties/CP_PARTIES/dev',
    publishingServiceProductEventQueue: {
        isFifoQueue: true,
        url: ''
    },
    searchCacheBatchSize: 5,
    storeDbHost: 'localhost:27017/product-store-local',
    storeDbHostJumpServer: 'localhost:27017/product-store-local',
    ubxWebsUrl: ''
};
exports.configProperties = {
    DEV: devConfigProperties,
    LOCAL: localConfigProperties,
    PRODUCTION: prodConfigProperties,
    QA: qaConfigProperties,
    TEST: testConfigProperties,
    UAT: uatConfigProperties
};
