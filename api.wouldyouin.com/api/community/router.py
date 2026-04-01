from fastapi import APIRouter
from api.community.contests.router import router as contests_router
from api.community.jobs.router import router as jobs_router
from api.community.board.router import router as board_router
from api.community.study.router import router as study_router
from api.community.connect.router import router as connect_router

router = APIRouter()


@router.get("/")
async def get_community():
    """커뮤니티 메인"""
    return {"message": "커뮤니티", "data": None}


router.include_router(contests_router, prefix="/contests", tags=["커뮤니티 - 공모전"])
router.include_router(jobs_router, prefix="/jobs", tags=["커뮤니티 - 채용"])
router.include_router(board_router, prefix="/board", tags=["커뮤니티 - 게시판"])
router.include_router(study_router, prefix="/study", tags=["커뮤니티 - 스터디"])
router.include_router(connect_router, prefix="/connect", tags=["커뮤니티 - 기업연결"])
