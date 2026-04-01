/** VDing Editor 48 UI Theme Enum */

export enum UITheme {
  SNS_FEED_CENTRIC="sns-feed-centric",SNS_GROUP_CENTRIC="sns-group-centric",SNS_SHORT_VIDEO="sns-short-video",SNS_COMMUNITY_BAND="sns-community-band",
  MSG_PRIVATE_CHAT="msg-private-chat",MSG_TEAM_COLLAB="msg-team-collab",MSG_CHANNEL="msg-channel",MSG_BUBBLE_CHAT="msg-bubble-chat",
  COMMUNITY_EVENT="community-event",COMMUNITY_SUBFORUM="community-subforum",COMMUNITY_MEMBERSHIP="community-membership",COMMUNITY_CAFE="community-cafe",
  COMMERCE_HANDMADE="commerce-handmade",COMMERCE_MARKETPLACE="commerce-marketplace",COMMERCE_INTERIOR="commerce-interior",COMMERCE_ROCKET="commerce-rocket",
  PROD_TODO="prod-todo",PROD_WORKSPACE="prod-workspace",PROD_PROJECT="prod-project",PROD_BIZ_COLLAB="prod-biz-collab",
  EDU_FLASHCARD="edu-flashcard",EDU_GAMIFICATION="edu-gamification",EDU_VIDEO_COURSE="edu-video-course",EDU_CONTENT="edu-content",
  HEALTH_TRACKER="health-tracker",HEALTH_MEDITATION="health-meditation",HEALTH_NUTRITION="health-nutrition",HEALTH_INTEGRATED="health-integrated",
  FIN_BUDGET="fin-budget",FIN_INVESTMENT="fin-investment",FIN_TRANSFER="fin-transfer",FIN_CRYPTO="fin-crypto",
  ESG_SCORING="esg-scoring",ESG_ENTERPRISE="esg-enterprise",
  MKTG_EMAIL="mktg-email",MKTG_SOCIAL="mktg-social",
  BOOKING_ACCOMMODATION="booking-accommodation",BOOKING_CLASS="booking-class",BOOKING_STORE="booking-store",BOOKING_ONDEMAND="booking-ondemand",
  MAP_RESTAURANT="map-restaurant",MAP_REALESTATE="map-realestate",MAP_TRAVEL="map-travel",MAP_NEARBY="map-nearby",
  AI_CHAT="ai-chat",AI_IMAGE_GEN="ai-image-gen",AI_ASSISTANT="ai-assistant",AI_VOICE="ai-voice",
}

export const THEME_CATEGORIES = [
  { id: "sns", label: "SNS", themes: [UITheme.SNS_FEED_CENTRIC,UITheme.SNS_GROUP_CENTRIC,UITheme.SNS_SHORT_VIDEO,UITheme.SNS_COMMUNITY_BAND] },
  { id: "msg", label: "메시지", themes: [UITheme.MSG_PRIVATE_CHAT,UITheme.MSG_TEAM_COLLAB,UITheme.MSG_CHANNEL,UITheme.MSG_BUBBLE_CHAT] },
  { id: "community", label: "커뮤니티", themes: [UITheme.COMMUNITY_EVENT,UITheme.COMMUNITY_SUBFORUM,UITheme.COMMUNITY_MEMBERSHIP,UITheme.COMMUNITY_CAFE] },
  { id: "commerce", label: "쇼핑몰", themes: [UITheme.COMMERCE_HANDMADE,UITheme.COMMERCE_MARKETPLACE,UITheme.COMMERCE_INTERIOR,UITheme.COMMERCE_ROCKET] },
  { id: "prod", label: "생산성", themes: [UITheme.PROD_TODO,UITheme.PROD_WORKSPACE,UITheme.PROD_PROJECT,UITheme.PROD_BIZ_COLLAB] },
  { id: "edu", label: "교육", themes: [UITheme.EDU_FLASHCARD,UITheme.EDU_GAMIFICATION,UITheme.EDU_VIDEO_COURSE,UITheme.EDU_CONTENT] },
  { id: "health", label: "헬스", themes: [UITheme.HEALTH_TRACKER,UITheme.HEALTH_MEDITATION,UITheme.HEALTH_NUTRITION,UITheme.HEALTH_INTEGRATED] },
  { id: "fin", label: "금융", themes: [UITheme.FIN_BUDGET,UITheme.FIN_INVESTMENT,UITheme.FIN_TRANSFER,UITheme.FIN_CRYPTO] },
  { id: "esg", label: "ESG", themes: [UITheme.ESG_SCORING,UITheme.ESG_ENTERPRISE] },
  { id: "mktg", label: "마케팅", themes: [UITheme.MKTG_EMAIL,UITheme.MKTG_SOCIAL] },
  { id: "booking", label: "예약/O2O", themes: [UITheme.BOOKING_ACCOMMODATION,UITheme.BOOKING_CLASS,UITheme.BOOKING_STORE,UITheme.BOOKING_ONDEMAND] },
  { id: "map", label: "지도/공간", themes: [UITheme.MAP_RESTAURANT,UITheme.MAP_REALESTATE,UITheme.MAP_TRAVEL,UITheme.MAP_NEARBY] },
  { id: "ai", label: "AI/챗봇", themes: [UITheme.AI_CHAT,UITheme.AI_IMAGE_GEN,UITheme.AI_ASSISTANT,UITheme.AI_VOICE] },
];

export function parseThemeSlug(slug: string): UITheme | null {
  return Object.values(UITheme).find(t => t === slug) || null;
}
