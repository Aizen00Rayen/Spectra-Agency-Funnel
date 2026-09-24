import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { BookingStatus, LeadStatus } from "@workspace/api-client-react";

export type AdminLang = "en" | "fr" | "ar";

export interface AdminTranslations {
  nav: {
    overview: string;
    leads: string;
    feedback: string;
    portfolio: string;
    video: string;
    availability: string;
    bookings: string;
    workspace: string;
    privateWorkspace: string;
    sessionEncrypted: string;
    signOut: string;
    liveData: string;
    operatingRoom: string;
    secureWorkspace: string;
  };
  common: {
    refresh: string;
    tryAgain: string;
    close: string;
    open: string;
    save: string;
    delete: string;
    loading: string;
    error: string;
    success: string;
    empty: string;
    allStatuses: string;
    generalConsultation: string;
    consultation: string;
    language: string;
  };
  leadStatuses: Record<string, string>;
  bookingStatuses: Record<string, string>;
  weekDays: string[];
  overview: {
    eyebrow: string;
    title: string;
    detail: string;
    reviewLeads: string;
    totalLeads: string;
    awaitingApproval: string;
    upcomingMeetings: string;
    qualifiedPipeline: string;
    newlyRegistered: string;
    needsDecision: string;
    confirmedConversations: string;
    approvedOpportunities: string;
    pipelinePulse: string;
    whatNeedsAttention: string;
    openPipeline: string;
    newRegistrations: string;
    confirmedMeetings: string;
    readiness: string;
    studioSystems: string;
    vslPublished: string;
    calendarConnected: string;
    availabilityConfigured: string;
    ready: string;
    needsSetup: string;
    operatingNote: string;
    keepFunnelHonest: string;
    updatedJustNow: string;
    noteParagraph: string;
    publicFunnelLive: string;
    checkCapacity: string;
  };
  leads: {
    eyebrow: string;
    title: string;
    detail: string;
    allStatuses: string;
    lead: string;
    company: string;
    received: string;
    status: string;
    nextStep: string;
    emptyTitle: string;
    emptyDetail: string;
    viewDetails: string;
    deleteLead: string;
    deleteConfirmTitle: string;
    deleteConfirmMessage: string;
    confirmDeleteBtn: string;
    cancelBtn: string;
    leadDetailsTitle: string;
    projectScope: string;
    servicesRequested: string;
    contactInformation: string;
    directEmail: string;
    phoneLabel: string;
    budgetLabel: string;
    businessTypeLabel: string;
    notProvided: string;
    deleteLeadSuccess: string;
  };
  video: {
    eyebrow: string;
    title: string;
    detail: string;
    currentVsl: string;
    noPublishedLesson: string;
    published: string;
    draft: string;
    videoAssetReady: string;
    added: string;
    publishBtn: string;
    publishing: string;
    nothingUploaded: string;
    uploadApproved: string;
    newAsset: string;
    uploadVsl: string;
    assetTitle: string;
    assetTitlePlaceholder: string;
    chooseFile: string;
    fileTypes: string;
    uploadSecurely: string;
    uploadDirectNote: string;
    requestingUpload: string;
    uploadingDirect: string;
    savingMetadata: string;
    uploadSuccess: string;
    uploadError: string;
    titleFilePrompt: string;
    linkTab: string;
    fileTab: string;
    driveUrlLabel: string;
    driveUrlPlaceholder: string;
    driveHelper: string;
    driveTip: string;
    saveLinkBtn: string;
    savingLink: string;
    saveLinkSuccess: string;
    titleLinkPrompt: string;
    cloudHosted: string;
  };
  availability: {
    eyebrow: string;
    title: string;
    detail: string;
    weeklyHours: string;
    consultationWindows: string;
    activeWindows: string;
    activeWindow: string;
    addWindow: string;
    openCapacity: string;
    day: string;
    starts: string;
    ends: string;
    timezone: string;
    addAvailability: string;
    saving: string;
    noWindow: string;
  };
  bookings: {
    eyebrow: string;
    title: string;
    detail: string;
    client: string;
    requestedTime: string;
    status: string;
    decision: string;
    approve: string;
    updateStatus: string;
    noBookingRequests: string;
    approvedLeadsAppear: string;
    approvalSuccessNote: string;
  };
  feedback: {
    eyebrow: string;
    title: string;
    detail: string;
    publishedOnLanding: string;
    liveProofCollection: string;
    allFeedback: string;
    refresh: string;
    noFeedbackYet: string;
    noFeedbackDetail: string;
    unpublishTitle: string;
    publishTitle: string;
    deleteTitle: string;
    deleteConfirm: string;
    urlLabel: string;
    added: string;
    adminAction: string;
    addClientVideo: string;
    clientFullName: string;
    roleTitle: string;
    companyName: string;
    metricResult: string;
    metricDesc: string;
    quoteLabel: string;
    quotePlaceholder: string;
    videoUrlLabel: string;
    quickPresets: string;
    publishImmediate: string;
    addFeedbackBtn: string;
    addingFeedback: string;
    fillRequired: string;
    addedSuccess: string;
  };
}

export const adminCopies: Record<AdminLang, AdminTranslations> = {
  en: {
    nav: {
      overview: "Overview",
      leads: "Leads",
      feedback: "Client feedback",
      portfolio: "Showcase Websites",
      video: "Video library",
      availability: "Availability",
      bookings: "Bookings",
      workspace: "Workspace",
      privateWorkspace: "Private workspace",
      sessionEncrypted: "Session encrypted",
      signOut: "Sign out",
      liveData: "Live data",
      operatingRoom: "Operating room",
      secureWorkspace: "Spectra / secure workspace",
    },
    common: {
      refresh: "Refresh",
      tryAgain: "Try again",
      close: "Close",
      open: "Open",
      save: "Save",
      delete: "Delete",
      loading: "Loading...",
      error: "Error encountered",
      success: "Action completed successfully",
      empty: "No items to display",
      allStatuses: "All statuses",
      generalConsultation: "General consultation",
      consultation: "Consultation",
      language: "Language",
    },
    leadStatuses: {
      [LeadStatus.registered]: "Registered",
      [LeadStatus.reviewing]: "Reviewing",
      [LeadStatus.approved]: "Approved",
      [LeadStatus.refused]: "Refused",
      [LeadStatus.scheduled]: "Scheduled",
      [LeadStatus.met]: "Met",
      [LeadStatus.fit]: "Qualified",
      [LeadStatus.not_fit]: "Not a fit",
      [LeadStatus.nurture]: "Nurture",
    },
    bookingStatuses: {
      [BookingStatus.requested]: "Requested",
      [BookingStatus.approved]: "Approved",
      [BookingStatus.cancelled]: "Cancelled",
      [BookingStatus.completed]: "Completed",
      [BookingStatus.no_show]: "No show",
    },
    weekDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    overview: {
      eyebrow: "Workspace overview",
      title: "Good morning, make the next move.",
      detail: "A concise view of the decisions waiting for the studio today.",
      reviewLeads: "Review leads",
      totalLeads: "Total leads",
      awaitingApproval: "Awaiting approval",
      upcomingMeetings: "Upcoming meetings",
      qualifiedPipeline: "Qualified pipeline",
      newlyRegistered: "newly registered",
      needsDecision: "Needs a decision",
      confirmedConversations: "Confirmed conversations",
      approvedOpportunities: "Approved opportunities",
      pipelinePulse: "Pipeline pulse",
      whatNeedsAttention: "What needs attention",
      openPipeline: "Open pipeline",
      newRegistrations: "New registrations",
      confirmedMeetings: "Confirmed meetings",
      readiness: "Readiness",
      studioSystems: "Studio systems",
      vslPublished: "VSL published",
      calendarConnected: "Calendar connected",
      availabilityConfigured: "Availability configured",
      ready: "Ready",
      needsSetup: "Needs setup",
      operatingNote: "Operating note",
      keepFunnelHonest: "Keep the funnel honest.",
      updatedJustNow: "Updated just now",
      noteParagraph: "Every lead deserves a clear next step. Review context before moving a registration, and let the public promise stay aligned with what the studio can actually deliver.",
      publicFunnelLive: "Public funnel is live",
      checkCapacity: "Check capacity",
    },
    leads: {
      eyebrow: "Lead pipeline",
      title: "Make every conversation legible.",
      detail: "Review context, choose the next honest step, and keep the pipeline moving.",
      allStatuses: "All statuses",
      lead: "Lead",
      company: "Company",
      received: "Received",
      status: "Status",
      nextStep: "Next step",
      emptyTitle: "No leads in this view",
      emptyDetail: "New consultation requests will appear here.",
      viewDetails: "View full details",
      deleteLead: "Delete lead",
      deleteConfirmTitle: "Delete Lead",
      deleteConfirmMessage: "Are you sure you want to delete this lead? Any associated consultation bookings will also be removed.",
      confirmDeleteBtn: "Yes, Delete Lead",
      cancelBtn: "Cancel",
      leadDetailsTitle: "Lead Consultation Details",
      projectScope: "Project scope & context",
      servicesRequested: "Services requested",
      contactInformation: "Contact information",
      directEmail: "Direct Email",
      phoneLabel: "Phone",
      budgetLabel: "Budget",
      businessTypeLabel: "Business Type",
      notProvided: "Not provided",
      deleteLeadSuccess: "Lead was deleted successfully.",
    },
    video: {
      eyebrow: "Video library",
      title: "Publish the lesson with confidence.",
      detail: "The public lesson is a promise. Keep its source file versioned, visible, and deliberate.",
      currentVsl: "Current VSL",
      noPublishedLesson: "No published lesson",
      published: "Published",
      draft: "Draft",
      videoAssetReady: "Video asset ready",
      added: "Added",
      publishBtn: "Publish to public lesson",
      publishing: "Publishing…",
      nothingUploaded: "Nothing uploaded yet",
      uploadApproved: "Upload the approved lesson source to make it available to the public funnel.",
      newAsset: "New asset",
      uploadVsl: "Upload a VSL",
      assetTitle: "Asset title",
      assetTitlePlaceholder: "The quiet decisions behind growth",
      chooseFile: "Choose a video file",
      fileTypes: "MP4, WebM, or QuickTime · up to 500 MB",
      uploadSecurely: "Upload securely",
      uploadDirectNote: "Your video goes directly to object storage through a presigned URL. The API never receives the file bytes.",
      requestingUpload: "Requesting secure upload…",
      uploadingDirect: "Uploading directly to object storage…",
      savingMetadata: "Saving asset metadata…",
      uploadSuccess: "The VSL is uploaded and ready to review.",
      uploadError: "Upload could not be completed. Nothing was published.",
      titleFilePrompt: "Add a title and choose a supported video file.",
      linkTab: "Google Drive / Link",
      fileTab: "Upload Video File",
      driveUrlLabel: "Google Drive / Video Link",
      driveUrlPlaceholder: "https://drive.google.com/file/d/.../view",
      driveHelper: "Paste a share link from Google Drive. Ensure file access is set to 'Anyone with the link can view'.",
      driveTip: "Tip: In Google Drive share settings, you can uncheck 'Viewers can download' to protect your video.",
      saveLinkBtn: "Save Video Link",
      savingLink: "Saving video link…",
      saveLinkSuccess: "Video link saved successfully. You can now publish it.",
      titleLinkPrompt: "Please provide a title and a valid video or Google Drive link.",
      cloudHosted: "Cloud Hosted (Drive / CDN)",
    },
    availability: {
      eyebrow: "Capacity settings",
      title: "Make availability easy to trust.",
      detail: "A clear weekly rhythm helps good-fit clients choose a time without a back-and-forth.",
      weeklyHours: "Weekly hours",
      consultationWindows: "Consultation windows",
      activeWindows: "active windows",
      activeWindow: "active window",
      addWindow: "Add a window",
      openCapacity: "Open capacity",
      day: "Day",
      starts: "Starts",
      ends: "Ends",
      timezone: "Timezone",
      addAvailability: "Add availability",
      saving: "Saving…",
      noWindow: "No consultation window",
    },
    bookings: {
      eyebrow: "Booking requests",
      title: "Confirm the room is ready.",
      detail: "Approve the right conversations, keep client context close, and manage meeting requests.",
      client: "Client",
      requestedTime: "Requested time",
      status: "Status",
      decision: "Decision",
      approve: "Approve",
      updateStatus: "Update status",
      noBookingRequests: "No booking requests",
      approvedLeadsAppear: "Approved leads will appear here when they choose a consultation time.",
      approvalSuccessNote: "Booking approved successfully.",
    },
    feedback: {
      eyebrow: "Selected Work / Proof",
      title: "Client feedback & video reviews",
      detail: "Upload and manage client testimonial videos displayed in the Selected Work section of the funnel.",
      publishedOnLanding: "published on landing page",
      liveProofCollection: "Live proof collection",
      allFeedback: "All client feedback",
      refresh: "Refresh",
      noFeedbackYet: "No client feedback uploaded yet",
      noFeedbackDetail: "Use the form on the right to add video testimonials for the Selected Work section.",
      unpublishTitle: "Unpublish from landing page",
      publishTitle: "Publish to landing page",
      deleteTitle: "Delete testimonial",
      deleteConfirm: "Are you sure you want to remove this client video feedback?",
      urlLabel: "URL",
      added: "Added",
      adminAction: "Admin action",
      addClientVideo: "Add client video feedback",
      clientFullName: "Client full name *",
      roleTitle: "Role / Title",
      companyName: "Company name *",
      metricResult: "Metric result",
      metricDesc: "Metric description",
      quoteLabel: "Client feedback quote *",
      quotePlaceholder: "Share the client's direct perspective on Spectra's work and impact...",
      videoUrlLabel: "Video URL (MP4 / WebM direct link) *",
      quickPresets: "Quick video sample presets:",
      publishImmediate: "Publish to landing page immediately",
      addFeedbackBtn: "Add client feedback video",
      addingFeedback: "Adding feedback...",
      fillRequired: "Please provide client name, company, quote, and video URL.",
      addedSuccess: "Client feedback added and published!",
    },
  },
  fr: {
    nav: {
      overview: "Vue d’ensemble",
      leads: "Prospects",
      feedback: "Retours clients",
      portfolio: "Sites Vitrines",
      video: "Médiathèque vidéo",
      availability: "Disponibilités",
      bookings: "Rendez-vous",
      workspace: "Espace de travail",
      privateWorkspace: "Espace sécurisé",
      sessionEncrypted: "Session chiffrée",
      signOut: "Déconnexion",
      liveData: "Données en direct",
      operatingRoom: "Salle de contrôle",
      secureWorkspace: "Spectra / espace sécurisé",
    },
    common: {
      refresh: "Actualiser",
      tryAgain: "Réessayer",
      close: "Fermer",
      open: "Ouvrir",
      save: "Enregistrer",
      delete: "Supprimer",
      loading: "Chargement...",
      error: "Erreur rencontrée",
      success: "Action réalisée avec succès",
      empty: "Aucun élément à afficher",
      allStatuses: "Tous les statuts",
      generalConsultation: "Consultation générale",
      consultation: "Consultation",
      language: "Langue",
    },
    leadStatuses: {
      [LeadStatus.registered]: "Enregistré",
      [LeadStatus.reviewing]: "En examen",
      [LeadStatus.approved]: "Approuvé",
      [LeadStatus.refused]: "Refusé",
      [LeadStatus.scheduled]: "Planifié",
      [LeadStatus.met]: "Effectué",
      [LeadStatus.fit]: "Qualifié",
      [LeadStatus.not_fit]: "Non retenu",
      [LeadStatus.nurture]: "À suivre",
    },
    bookingStatuses: {
      [BookingStatus.requested]: "Demandé",
      [BookingStatus.approved]: "Confirmé",
      [BookingStatus.cancelled]: "Annulé",
      [BookingStatus.completed]: "Terminé",
      [BookingStatus.no_show]: "Absent",
    },
    weekDays: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
    overview: {
      eyebrow: "Aperçu du studio",
      title: "Bonjour, passez à l’action.",
      detail: "Une vue synthétique des décisions en attente au studio aujourd’hui.",
      reviewLeads: "Examiner les prospects",
      totalLeads: "Total prospects",
      awaitingApproval: "En attente",
      upcomingMeetings: "Rendez-vous à venir",
      qualifiedPipeline: "Opportunités qualifiées",
      newlyRegistered: "nouveaux inscrits",
      needsDecision: "Décision requise",
      confirmedConversations: "Échanges confirmés",
      approvedOpportunities: "Opportunités validées",
      pipelinePulse: "Pouls du pipeline",
      whatNeedsAttention: "Actions prioritaires",
      openPipeline: "Ouvrir le pipeline",
      newRegistrations: "Nouvelles inscriptions",
      confirmedMeetings: "Rendez-vous confirmés",
      readiness: "État des systèmes",
      studioSystems: "Systèmes du studio",
      vslPublished: "VSL publiée",
      calendarConnected: "Calendrier connecté",
      availabilityConfigured: "Disponibilités configurées",
      ready: "Prêt",
      needsSetup: "À configurer",
      operatingNote: "Note de cadrage",
      keepFunnelHonest: "Maintenir la clarté du funnel.",
      updatedJustNow: "Mis à jour à l’instant",
      noteParagraph: "Chaque prospect mérite une suite claire. Examinez le contexte avant de qualifier, et gardez la promesse alignée avec les capacités réelles du studio.",
      publicFunnelLive: "Le funnel public est en ligne",
      checkCapacity: "Vérifier la capacité",
    },
    leads: {
      eyebrow: "Pipeline de prospects",
      title: "Rendre chaque échange lisible.",
      detail: "Examinez le contexte, décidez de la prochaine étape et maintenez la dynamique commerciale.",
      allStatuses: "Tous les statuts",
      lead: "Prospect",
      company: "Entreprise",
      received: "Reçu le",
      status: "Statut",
      nextStep: "Action",
      emptyTitle: "Aucun prospect dans cette vue",
      emptyDetail: "Les nouvelles demandes de consultation apparaîtront ici.",
      viewDetails: "Voir les détails complets",
      deleteLead: "Supprimer le prospect",
      deleteConfirmTitle: "Supprimer le prospect",
      deleteConfirmMessage: "Êtes-vous sûr de vouloir supprimer ce prospect ? Toutes les demandes de rendez-vous associées seront également supprimées.",
      confirmDeleteBtn: "Oui, supprimer",
      cancelBtn: "Annuler",
      leadDetailsTitle: "Détails de la demande",
      projectScope: "Périmètre & description du projet",
      servicesRequested: "Services demandés",
      contactInformation: "Coordonnées de contact",
      directEmail: "Email direct",
      phoneLabel: "Téléphone",
      budgetLabel: "Budget",
      businessTypeLabel: "Type d'entreprise",
      notProvided: "Non renseigné",
      deleteLeadSuccess: "Le prospect a été supprimé avec succès.",
    },
    video: {
      eyebrow: "Médiathèque vidéo",
      title: "Publiez la leçon en toute confiance.",
      detail: "La leçon publique est un engagement. Gardez sa version source claire, visible et réfléchie.",
      currentVsl: "VSL actuelle",
      noPublishedLesson: "Aucune leçon publiée",
      published: "Publié",
      draft: "Brouillon",
      videoAssetReady: "Fichier vidéo prêt",
      added: "Ajouté le",
      publishBtn: "Publier sur la page publique",
      publishing: "Publication en cours…",
      nothingUploaded: "Rien n'a été importé pour l'instant",
      uploadApproved: "Téléversez la vidéo validée pour la rendre disponible sur le funnel public.",
      newAsset: "Nouveau fichier",
      uploadVsl: "Téléverser une vidéo",
      assetTitle: "Titre de la vidéo",
      assetTitlePlaceholder: "Les décisions stratégiques derrière la croissance",
      chooseFile: "Choisir un fichier vidéo",
      fileTypes: "MP4, WebM ou QuickTime · jusqu'à 500 Mo",
      uploadSecurely: "Téléverser en toute sécurité",
      uploadDirectNote: "Votre vidéo est envoyée directement vers le stockage sécurisé via une URL signée. Les octets ne transitent pas par l'API.",
      requestingUpload: "Demande d'autorisation de transfert…",
      uploadingDirect: "Transfert direct vers le stockage…",
      savingMetadata: "Enregistrement des métadonnées…",
      uploadSuccess: "La VSL est téléversée et prête pour révision.",
      uploadError: "Le transfert n'a pas pu aboutir. Rien n'a été publié.",
      titleFilePrompt: "Ajoutez un titre et choisissez un fichier vidéo compatible.",
      linkTab: "Lien Google Drive / Web",
      fileTab: "Téléverser un fichier",
      driveUrlLabel: "Lien Google Drive ou vidéo externe",
      driveUrlPlaceholder: "https://drive.google.com/file/d/.../view",
      driveHelper: "Collez le lien de partage Google Drive. Assurez-vous que l'accès est défini sur « Tous les utilisateurs disposant du lien peuvent voir ».",
      driveTip: "Conseil : Dans les paramètres de partage Drive, vous pouvez désactiver le téléchargement par les lecteurs.",
      saveLinkBtn: "Enregistrer le lien vidéo",
      savingLink: "Enregistrement du lien…",
      saveLinkSuccess: "Lien vidéo enregistré avec succès. Vous pouvez maintenant le publier.",
      titleLinkPrompt: "Veuillez fournir un titre et un lien Google Drive ou vidéo valide.",
      cloudHosted: "Hébergé sur le Cloud (Drive / CDN)",
    },
    availability: {
      eyebrow: "Paramètres de capacité",
      title: "Rendez vos disponibilités fiables.",
      detail: "Un rythme hebdomadaire clair permet aux clients de choisir un créneau sans friction.",
      weeklyHours: "Horaires hebdomadaires",
      consultationWindows: "Créneaux de consultation",
      activeWindows: "créneaux actifs",
      activeWindow: "créneau actif",
      addWindow: "Ajouter une plage",
      openCapacity: "Ouvrir une plage",
      day: "Jour",
      starts: "Début",
      ends: "Fin",
      timezone: "Fuseau horaire",
      addAvailability: "Ajouter la disponibilité",
      saving: "Enregistrement…",
      noWindow: "Aucun créneau ce jour",
    },
    bookings: {
      eyebrow: "Demandes de rendez-vous",
      title: "Confirmez les rendez-vous.",
      detail: "Validez les bons échanges, gardez le contexte client à portée de main et gérez les réservations.",
      client: "Client",
      requestedTime: "Créneau demandé",
      status: "Statut",
      decision: "Décision",
      approve: "Approuver",
      updateStatus: "Modifier le statut",
      noBookingRequests: "Aucune demande de réservation",
      approvedLeadsAppear: "Les prospects qualifiés apparaîtront ici lorsqu'ils choisissent un créneau.",
      approvalSuccessNote: "Rendez-vous approuvé avec succès.",
    },
    feedback: {
      eyebrow: "Projets choisis / Preuves",
      title: "Retours clients & vidéos",
      detail: "Gérez les vidéos de témoignages clients affichées dans la section Projets choisis du funnel.",
      publishedOnLanding: "publiés sur la page publique",
      liveProofCollection: "Collection de retours clients",
      allFeedback: "Tous les retours clients",
      refresh: "Actualiser",
      noFeedbackYet: "Aucun retour client téléversé pour le moment",
      noFeedbackDetail: "Utilisez le formulaire à droite pour ajouter des vidéos de témoignage dans la section Projets choisis.",
      unpublishTitle: "Dépublier du site public",
      publishTitle: "Publier sur le site public",
      deleteTitle: "Supprimer le retour",
      deleteConfirm: "Êtes-vous sûr de vouloir supprimer ce retour vidéo client ?",
      urlLabel: "URL",
      added: "Ajouté le",
      adminAction: "Action studio",
      addClientVideo: "Ajouter un retour vidéo client",
      clientFullName: "Nom complet du client *",
      roleTitle: "Poste / Titre",
      companyName: "Entreprise *",
      metricResult: "Chiffre clé obtenu",
      metricDesc: "Description du chiffre",
      quoteLabel: "Citation / Synthèse du client *",
      quotePlaceholder: "Partagez le retour d'expérience direct du client sur l'impact de Spectra...",
      videoUrlLabel: "URL directe de la vidéo (MP4 / WebM) *",
      quickPresets: "Exemples rapides préconfigurés :",
      publishImmediate: "Publier immédiatement sur le site public",
      addFeedbackBtn: "Ajouter le retour vidéo",
      addingFeedback: "Ajout en cours...",
      fillRequired: "Veuillez renseigner le nom, l'entreprise, la citation et l'URL vidéo.",
      addedSuccess: "Retour vidéo client ajouté et publié !",
    },
  },
  ar: {
    nav: {
      overview: "نظرة عامة",
      leads: "طلبات التواصل",
      feedback: "آراء العملاء",
      portfolio: "المواقع المعروضة",
      video: "مكتبة الفيديو",
      availability: "أوقات العمل",
      bookings: "الحجوزات",
      workspace: "مساحة العمل",
      privateWorkspace: "مساحة خاصة",
      sessionEncrypted: "الجلسة مشفرة",
      signOut: "تسجيل الخروج",
      liveData: "بيانات حية",
      operatingRoom: "غرفة العمليات",
      secureWorkspace: "سبيكترا / مساحة آمنة",
    },
    common: {
      refresh: "تحديث",
      tryAgain: "إعادة المحاولة",
      close: "إغلاق",
      open: "فتح",
      save: "حفظ",
      delete: "حذف",
      loading: "جاري التحميل...",
      error: "حدث خطأ",
      success: "تمت العملية بنجاح",
      empty: "لا توجد عناصر لعرضها",
      allStatuses: "جميع الحالات",
      generalConsultation: "استشارة عامة",
      consultation: "جلسة استشارية",
      language: "اللغة",
    },
    leadStatuses: {
      [LeadStatus.registered]: "مسجل حديثاً",
      [LeadStatus.reviewing]: "قيد المراجعة",
      [LeadStatus.approved]: "تمت الموافقة",
      [LeadStatus.refused]: "مرفوض",
      [LeadStatus.scheduled]: "مجدول",
      [LeadStatus.met]: "تم اللقاء",
      [LeadStatus.fit]: "مؤهل",
      [LeadStatus.not_fit]: "غير مناسب",
      [LeadStatus.nurture]: "متابعة لاحقة",
    },
    bookingStatuses: {
      [BookingStatus.requested]: "قيد الطلب",
      [BookingStatus.approved]: "مؤكد",
      [BookingStatus.cancelled]: "ملغى",
      [BookingStatus.completed]: "مكتمل",
      [BookingStatus.no_show]: "لم يحضر",
    },
    weekDays: ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"],
    overview: {
      eyebrow: "نظرة عامة على الاستوديو",
      title: "صباح الخير، لنبدأ الخطوة التالية.",
      detail: "رؤية موجزة ومباشرة لكافة القرارات والمواعيد المطلوبة اليوم.",
      reviewLeads: "مراجعة الطلبات",
      totalLeads: "إجمالي الطلبات",
      awaitingApproval: "في انتظار الموافقة",
      upcomingMeetings: "الاجتماعات القادمة",
      qualifiedPipeline: "الفرص المؤهلة",
      newlyRegistered: "مسجل جديد",
      needsDecision: "يتطلب قراراً",
      confirmedConversations: "محادثات مؤكدة",
      approvedOpportunities: "فرص معتمدة",
      pipelinePulse: "حركة الطلبات",
      whatNeedsAttention: "أولويات المتابعة",
      openPipeline: "فتح قائمة الطلبات",
      newRegistrations: "تسجيلات جديدة",
      confirmedMeetings: "اجتماعات مؤكدة",
      readiness: "جاهزية الأنظمة",
      studioSystems: "أنظمة الاستوديو",
      vslPublished: "فيديو العرض منشور",
      calendarConnected: "التقويم متصل",
      availabilityConfigured: "الأوقات محددة",
      ready: "جاهز",
      needsSetup: "يتطلب إعداد",
      operatingNote: "ملاحظة تشغيلية",
      keepFunnelHonest: "الحفاظ على وضوح ومصداقية القمع.",
      updatedJustNow: "تم التحديث الآن",
      noteParagraph: "كل عميل محتمل يستحق خطوة تالية واضحة. راجع السياق قبل اتخاذ القرار، واجعل وعود الاستوديو متوافقة تماماً مع ما يمكن تقديمه بجودة فائقة.",
      publicFunnelLive: "القمع العام نشط",
      checkCapacity: "فحص السعة المتاحة",
    },
    leads: {
      eyebrow: "قمع العملاء المحتملين",
      title: "اجعل كل محادثة واضحة ومثمرة.",
      detail: "راجع تفاصيل المشروع وسياقه، وحدد الخطوة التالية بنزاهة واحترافية.",
      allStatuses: "جميع الحالات",
      lead: "العميل",
      company: "الشركة",
      received: "تاريخ الاستلام",
      status: "الحالة",
      nextStep: "الخطوة التالية",
      emptyTitle: "لا توجد طلبات في هذا العرض",
      emptyDetail: "ستظهر طلبات الاستشارة الجديدة هنا فور إرسالها.",
      viewDetails: "عرض التفاصيل الكاملة",
      deleteLead: "حذف العميل",
      deleteConfirmTitle: "حذف العميل المحتمل",
      deleteConfirmMessage: "هل أنت متأكد من رغبتك في حذف هذا العميل؟ سيتم أيضاً حذف كافة طلبات المواعيد المرتبطة به.",
      confirmDeleteBtn: "نعم، حذف العميل",
      cancelBtn: "إلغاء",
      leadDetailsTitle: "تفاصيل طلب الاستشارة",
      projectScope: "نطاق المشروع ووصف الاحتياج",
      servicesRequested: "الخدمات المطلوبة",
      contactInformation: "معلومات التواصل",
      directEmail: "البريد الإلكتروني المباشر",
      phoneLabel: "رقم الهاتف",
      budgetLabel: "الميزانية المقدرة",
      businessTypeLabel: "نوع النشاط التجاري",
      notProvided: "غير محدد",
      deleteLeadSuccess: "تم حذف العميل بنجاح.",
    },
    video: {
      eyebrow: "مكتبة الفيديو",
      title: "انشر الدرس الاستراتيجي بكل ثقة.",
      detail: "الدرس العام هو بمثابة وعد لعملائنا. احرص على أن تكون نسخته المصدرية منظمة ومحدّثة.",
      currentVsl: "الفيديو المنشور حالياً",
      noPublishedLesson: "لم يتم نشر فيديو بعد",
      published: "منشور",
      draft: "مسودة",
      videoAssetReady: "ملف الفيديو جاهز",
      added: "أُضيف بتاريخ",
      publishBtn: "نشر على الصفحة العامة",
      publishing: "جاري النشر…",
      nothingUploaded: "لم يتم رفع أي فيديو بعد",
      uploadApproved: "قم برفع ملف الفيديو المعتمد ليكون متاحاً في القمع التسويقي العام.",
      newAsset: "ملف جديد",
      uploadVsl: "رفع فيديو جديد",
      assetTitle: "عنوان الفيديو",
      assetTitlePlaceholder: "القرارات الهادئة وراء النمو الرقمي",
      chooseFile: "اختر ملف الفيديو",
      fileTypes: "MP4 أو WebM أو QuickTime · حتى 500 ميغابايت",
      uploadSecurely: "رفع بأمان",
      uploadDirectNote: "يتم إرسال الفيديو مباشرة إلى وحدة التخزين الآمنة عبر رابط موقع مسبقاً دون استهلاك خادم التطبيق.",
      requestingUpload: "جاري طلب إذن الرفع الآمن…",
      uploadingDirect: "جاري الرفع المباشر…",
      savingMetadata: "جاري حفظ البيانات الوصفية…",
      uploadSuccess: "تم رفع الفيديو بنجاح وهو جاهز للمعاينة.",
      uploadError: "تعذر إتمام الرفع. لم يتم نشر أي ملف.",
      titleFilePrompt: "يرجى كتابة عنوان واختيار ملف فيديو صالح.",
      linkTab: "رابط Google Drive / خارجي",
      fileTab: "رفع ملف فيديو",
      driveUrlLabel: "رابط Google Drive أو فيديو خارجي",
      driveUrlPlaceholder: "https://drive.google.com/file/d/.../view",
      driveHelper: "الصق رابط المشاركة من Google Drive. تأكد من ضبط إمكانية الوصول على «أي شخص لديه الرابط يمكنه المشاهدة».",
      driveTip: "ملاحظة: يمكنك في إعدادات مشاركة Drive إلغاء تفعيل خيار التحميل لمنع المشاهدين من تنزيل الفيديو.",
      saveLinkBtn: "حفظ رابط الفيديو",
      savingLink: "جاري حفظ الرابط…",
      saveLinkSuccess: "تم حفظ رابط الفيديو بنجاح. يمكنك الآن نشره.",
      titleLinkPrompt: "يرجى إدخال عنوان ورابط صالح من Google Drive أو رابط فيديو.",
      cloudHosted: "مستضاف سحابياً (Drive / CDN)",
    },
    availability: {
      eyebrow: "إعدادات أوقات العمل",
      title: "اجعل أوقاتك واضحة وموثوقة.",
      detail: "جدول أسبوعي محدد يساعد العملاء المناسبين على حجز الموعد دون الحاجة لمراسلات متكررة.",
      weeklyHours: "الساعات الأسبوعية",
      consultationWindows: "فترات الاستشارات",
      activeWindows: "فترات نشطة",
      activeWindow: "فترة نشطة",
      addWindow: "إضافة فترة",
      openCapacity: "فتح فترة شاغرة",
      day: "اليوم",
      starts: "يبدأ",
      ends: "ينتهي",
      timezone: "المنطقة الزمنية",
      addAvailability: "إضافة الفترة",
      saving: "جاري الحفظ…",
      noWindow: "لا توجد أوقات استشارة في هذا اليوم",
    },
    bookings: {
      eyebrow: "طلبات الحجز",
      title: "تأكيد جاهزية المواعيد.",
      detail: "اعتمد الجلسات المناسبة، واطلع على تفاصيل العميل، وتابع طلبات الحجز بسهولة.",
      client: "العميل",
      requestedTime: "الوقت المطلوب",
      status: "الحالة",
      decision: "القرار",
      approve: "موافقة",
      updateStatus: "تعديل الحالة",
      noBookingRequests: "لا توجد طلبات حجز",
      approvedLeadsAppear: "ستظهر طلبات العملاء المؤهلين هنا فور اختيارهم للموعد المناسب.",
      approvalSuccessNote: "تمت الموافقة على الموعد بنجاح.",
    },
    feedback: {
      eyebrow: "أعمال مختارة / آراء العملاء",
      title: "آراء العملاء ومراجعات الفيديو",
      detail: "إدارة ونشر مقاطع فيديو آراء العملاء المعروضة في قسم الأعمال المختارة على الصفحة العامة.",
      publishedOnLanding: "منشور على الصفحة العامة",
      liveProofCollection: "مجموعة آراء العملاء الموثقة",
      allFeedback: "كافة آراء العملاء",
      refresh: "تحديث",
      noFeedbackYet: "لم تتم إضافة أي مراجعات فيديو بعد",
      noFeedbackDetail: "استخدم النموذج على اليسار لإضافة فيديوهات تجارب العملاء في قسم أعمال مختارة.",
      unpublishTitle: "إلغاء النشر من الصفحة العامة",
      publishTitle: "نشر على الصفحة العامة",
      deleteTitle: "حذف المراجعة",
      deleteConfirm: "هل أنت متأكد من رغبتك في حذف هذا الفيديو التقييمي؟",
      urlLabel: "الرابط",
      added: "تاريخ الإضافة",
      adminAction: "إجراء الإدارة",
      addClientVideo: "إضافة فيديو رأي عميل",
      clientFullName: "الاسم الكامل للعميل *",
      roleTitle: "المسمى الوظيفي / المنصب",
      companyName: "اسم الشركة *",
      metricResult: "النتيجة الرقمية المحققة",
      metricDesc: "وصف النتيجة",
      quoteLabel: "اقتباس أو ملخص كلام العميل *",
      quotePlaceholder: "شارك الرأي المباشر للعميل حول تجربة العمل مع استوديو سبيكترا...",
      videoUrlLabel: "رابط الفيديو المباشر (MP4 / WebM) *",
      quickPresets: "نماذج فيديو تجريبية سريعة:",
      publishImmediate: "النشر فوراً على الصفحة العامة",
      addFeedbackBtn: "إضافة فيديو رأي العميل",
      addingFeedback: "جاري الإضافة...",
      fillRequired: "يرجى ملء اسم العميل، الشركة، الاقتباس ورابط الفيديو.",
      addedSuccess: "تمت إضافة رأي العميل ونشره بنجاح!",
    },
  },
};

interface AdminLangContextValue {
  lang: AdminLang;
  setLang: (lang: AdminLang) => void;
  t: AdminTranslations;
  isRtl: boolean;
  formatAdminDate: (value?: string | null) => string;
  formatAdminDateTime: (value?: string | null, timezone?: string | null) => string;
}

const AdminLangContext = createContext<AdminLangContextValue | null>(null);

export function AdminLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("spectra_admin_lang");
      if (saved === "en" || saved === "fr" || saved === "ar") return saved;
    }
    return "en";
  });

  const setLang = (next: AdminLang) => {
    setLangState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("spectra_admin_lang", next);
    }
  };

  const isRtl = lang === "ar";
  const t = adminCopies[lang];

  const formatAdminDate = (value?: string | null) => {
    if (!value) return "—";
    const locale = lang === "ar" ? "ar-EG" : lang === "fr" ? "fr-FR" : "en-GB";
    return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
  };

  const formatAdminDateTime = (value?: string | null, timezone?: string | null) => {
    if (!value) return "—";
    const locale = lang === "ar" ? "ar-EG" : lang === "fr" ? "fr-FR" : "en-GB";
    return `${new Intl.DateTimeFormat(locale, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value))}${timezone ? ` · ${timezone}` : ""}`;
  };

  return (
    <AdminLangContext.Provider value={{ lang, setLang, t, isRtl, formatAdminDate, formatAdminDateTime }}>
      {children}
    </AdminLangContext.Provider>
  );
}

export function useAdminLang(): AdminLangContextValue {
  const ctx = useContext(AdminLangContext);
  if (!ctx) {
    // Fallback if rendered outside provider
    const lang: AdminLang = "en";
    return {
      lang,
      setLang: () => {},
      t: adminCopies.en,
      isRtl: false,
      formatAdminDate: (val?: string | null) => (!val ? "—" : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(val))),
      formatAdminDateTime: (val?: string | null, tz?: string | null) => (!val ? "—" : `${new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(val))}${tz ? ` · ${tz}` : ""}`),
    };
  }
  return ctx;
}
