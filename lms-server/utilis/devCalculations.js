/**
 * Calculate web development total
 */
exports.calculateWebTotal = (webApp) => {
  if (!webApp) return 0;

  let total = 0;

  // Frontend
  if (webApp.frontend) {
    webApp.frontend.subTotal =
      (webApp.frontend.reactJs?.total || 0) +
      (webApp.frontend.reduxStateManagement?.total || 0) +
      (webApp.frontend.tailwindCss?.total || 0) +
      (webApp.frontend.responsiveDesign?.total || 0);
    total += webApp.frontend.subTotal;
  }

  // Backend
  if (webApp.backend) {
    webApp.backend.subTotal =
      (webApp.backend.nodeJs?.total || 0) +
      (webApp.backend.expressFramework?.total || 0) +
      (webApp.backend.apiDevelopment?.total || 0) +
      (webApp.backend.databaseDesign?.total || 0) +
      (webApp.backend.authentication?.total || 0);
    total += webApp.backend.subTotal;
  }

  // Database
  if (webApp.database) {
    webApp.database.subTotal =
      (webApp.database.mongodbAtlas?.total || 0) +
      (webApp.database.redisCache?.total || 0) +
      (webApp.database.dataMigration?.total || 0);
    total += webApp.database.subTotal;
  }

  // Third Party
  if (webApp.thirdParty) {
    webApp.thirdParty.subTotal =
      (webApp.thirdParty.paymentGateway?.setup || 0) +
      (webApp.thirdParty.paymentGateway?.integration || 0) +
      (webApp.thirdParty.emailService?.setup || 0) +
      (webApp.thirdParty.smsService?.setup || 0) +
      (webApp.thirdParty.videoConferencing?.setup || 0);
    total += webApp.thirdParty.subTotal;
  }

  return total;
};

/**
 * Calculate mobile development total
 */
exports.calculateMobileTotal = (mobileApp) => {
  if (!mobileApp) return 0;

  let total = 0;

  // Cross Platform
  if (mobileApp.crossPlatform) {
    mobileApp.crossPlatform.subTotal =
      (mobileApp.crossPlatform.reactNative?.total || 0) -
      (mobileApp.crossPlatform.codeSharing?.savings || 0);
    total += mobileApp.crossPlatform.subTotal;
  }

  // iOS Specific
  if (mobileApp.iosSpecific) {
    mobileApp.iosSpecific.subTotal =
      (mobileApp.iosSpecific.swiftHelpers?.total || 0) +
      (mobileApp.iosSpecific.appStoreConnect?.setup || 0) +
      (mobileApp.iosSpecific.pushNotifications?.total || 0);
    total += mobileApp.iosSpecific.subTotal;
  }

  // Android Specific
  if (mobileApp.androidSpecific) {
    mobileApp.androidSpecific.subTotal =
      (mobileApp.androidSpecific.kotlinHelpers?.total || 0) +
      (mobileApp.androidSpecific.googlePlayServices?.total || 0) +
      (mobileApp.androidSpecific.firebaseIntegration?.total || 0);
    total += mobileApp.androidSpecific.subTotal;
  }

  // Mobile Features
  if (mobileApp.mobileFeatures) {
    mobileApp.mobileFeatures.subTotal =
      (mobileApp.mobileFeatures.offlineAccess?.total || 0) +
      (mobileApp.mobileFeatures.pushNotifications?.total || 0) +
      (mobileApp.mobileFeatures.biometricAuth?.total || 0) +
      (mobileApp.mobileFeatures.mobilePayments?.upi || 0) +
      (mobileApp.mobileFeatures.mobilePayments?.wallet || 0);
    total += mobileApp.mobileFeatures.subTotal;
  }

  return total;
};

/**
 * Calculate design total
 */
exports.calculateDesignTotal = (design) => {
  if (!design) return 0;

  let total = 0;

  // Web Design
  if (design.webDesign) {
    design.webDesign.subTotal =
      (design.webDesign.wireframing?.total || 0) +
      (design.webDesign.prototyping?.total || 0) +
      (design.webDesign.uiKits?.purchase || 0) +
      (design.webDesign.uiKits?.customization || 0) +
      (design.webDesign.responsiveMockups?.total || 0);
    total += design.webDesign.subTotal;
  }

  // Mobile Design
  if (design.mobileDesign) {
    design.mobileDesign.subTotal =
      (design.mobileDesign.iosHIG?.total || 0) +
      (design.mobileDesign.materialDesign?.total || 0) +
      (design.mobileDesign.appIcons?.design || 0) +
      (design.mobileDesign.appIcons?.variants || 0) +
      (design.mobileDesign.splashScreens?.total || 0);
    total += design.mobileDesign.subTotal;
  }

  // Branding
  if (design.branding) {
    design.branding.subTotal =
      (design.branding.logo?.design || 0) +
      (design.branding.logo?.revisions || 0) +
      (design.branding.colorPalette?.development || 0) +
      (design.branding.typography?.licensing || 0) +
      (design.branding.brandGuidelines?.creation || 0);
    total += design.branding.subTotal;
  }

  return total;
};

/**
 * Calculate QA & Testing total
 */
exports.calculateQATotal = (qaTesting) => {
  if (!qaTesting) return 0;

  let total = 0;

  // Manual Testing
  if (qaTesting.manualTesting) {
    qaTesting.manualTesting.subTotal =
      (qaTesting.manualTesting.functional?.total || 0) +
      (qaTesting.manualTesting.regression?.total || 0) +
      (qaTesting.manualTesting.uxTesting?.total || 0);
    total += qaTesting.manualTesting.subTotal;
  }

  // Automated Testing
  if (qaTesting.automatedTesting) {
    qaTesting.automatedTesting.subTotal =
      (qaTesting.automatedTesting.jestSetup?.total || 0) +
      (qaTesting.automatedTesting.cypress?.total || 0) +
      (qaTesting.automatedTesting.loadTesting?.total || 0);
    total += qaTesting.automatedTesting.subTotal;
  }

  // Device Testing
  if (qaTesting.deviceTesting) {
    qaTesting.deviceTesting.subTotal =
      (qaTesting.deviceTesting.iosDevices?.rental || 0) +
      (qaTesting.deviceTesting.androidDevices?.rental || 0) +
      (qaTesting.deviceTesting.browserStack?.subscription || 0);
    total += qaTesting.deviceTesting.subTotal;
  }

  // Security Audit
  if (qaTesting.securityAudit) {
    qaTesting.securityAudit.subTotal =
      (qaTesting.securityAudit.penetrationTesting?.cost || 0) +
      (qaTesting.securityAudit.vulnerabilityScan?.cost || 0) +
      (qaTesting.securityAudit.sslSetup?.cost || 0);
    total += qaTesting.securityAudit.subTotal;
  }

  return total;
};

/**
 * Calculate deployment total
 */
exports.calculateDeploymentTotal = (deployment) => {
  if (!deployment) return 0;

  let total = 0;

  // App Store Accounts
  if (deployment.appStoreAccounts) {
    deployment.appStoreAccounts.subTotal =
      (deployment.appStoreAccounts.appleDeveloper?.threeYear || 0) +
      (deployment.appStoreAccounts.googlePlay?.oneTime || 0);
    total += deployment.appStoreAccounts.subTotal;
  }

  // Domain & SSL
  if (deployment.domainAndSSL) {
    deployment.domainAndSSL.subTotal =
      (deployment.domainAndSSL.domainName?.purchase || 0) +
      (deployment.domainAndSSL.domainName?.renewal || 0) +
      (deployment.domainAndSSL.sslCertificate?.premium || 0);
    total += deployment.domainAndSSL.subTotal;
  }

  // Server Setup
  if (deployment.serverSetup) {
    deployment.serverSetup.subTotal =
      (deployment.serverSetup.configuration?.total || 0) +
      (deployment.serverSetup.loadBalancer?.setup || 0) +
      (deployment.serverSetup.autoScaling?.setup || 0);
    total += deployment.serverSetup.subTotal;
  }

  return total;
};

/**
 * Calculate grand total for development investment
 */
exports.calculateGrandTotal = (data) => {
  return (
    (data.webApp?.totalWeb || 0) +
    (data.mobileApp?.totalMobile || 0) +
    (data.design?.totalDesign || 0) +
    (data.qaTesting?.totalQA || 0) +
    (data.deployment?.totalDeployment || 0)
  );
};

/**
 * Calculate cost based on hours and rate
 */
exports.calculateHourlyCost = (hours, ratePerHour) => {
  return hours * ratePerHour;
};

/**
 * Format currency
 */
exports.formatCurrency = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
