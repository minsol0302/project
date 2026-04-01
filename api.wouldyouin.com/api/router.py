from fastapi import APIRouter
from api.auth.router import router as auth_router
from api.feed.router import router as feed_router
from api.learning.router import router as learning_router
from api.community.router import router as community_router
from api.explore.router import router as explore_router
from api.profile.router import router as profile_router
from api.vding.router import vding_router
from api.AI_V_chatbot.router import router as ai_v_chatbot_router
from api.admin.router import router as admin_router
from api.social.router import router as social_router
from api.ai.router import router as ai_router
from api.drafts.router import router as drafts_router
from api.create2.router import router as create2_router
from api.create.router import router as create_router
from api.schedule.router import router as schedule_router
from api.vding_editor.router import router as vding_editor_router
from api.feed2.router import router as feed2_router

api_router = APIRouter()

api_router.include_router(auth_router,           prefix="/auth",          tags=["auth"])
api_router.include_router(feed_router,           prefix="/feed",          tags=["feed"])
api_router.include_router(learning_router,       prefix="/learning",      tags=["learning"])
api_router.include_router(community_router,      prefix="/community",     tags=["community"])
api_router.include_router(explore_router,        prefix="/explore",       tags=["explore"])
api_router.include_router(profile_router,        prefix="/profile",       tags=["profile"])
api_router.include_router(vding_router,          prefix="/vding",         tags=["vding"])
api_router.include_router(ai_v_chatbot_router,   prefix="/ai-v-chatbot",  tags=["ai-v-chatbot"])
api_router.include_router(admin_router,          prefix="/admin",         tags=["admin"])
api_router.include_router(social_router,         prefix="/social",        tags=["social"])
api_router.include_router(ai_router,             prefix="/ai",            tags=["ai"])
api_router.include_router(drafts_router,         prefix="/drafts",        tags=["drafts"])
api_router.include_router(create_router,         prefix="/create",        tags=["create"])
api_router.include_router(create2_router,        prefix="/create2",       tags=["create2"])
api_router.include_router(schedule_router,       prefix="/schedule",      tags=["schedule"])
api_router.include_router(vding_editor_router,   prefix="/vding-editor",  tags=["vding-editor"])
api_router.include_router(feed2_router,          prefix="/feed2",         tags=["feed2"])