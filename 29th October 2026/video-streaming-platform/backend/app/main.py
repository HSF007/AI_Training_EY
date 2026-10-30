
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import engine


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="CineStream video streaming platform API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "If-Match",
        "X-Request-ID",
    ],
)

app.include_router(api_router)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException,
):
    code_by_status = {
        401: "UNAUTHENTICATED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        409: "CONFLICT",
        429: "RATE_LIMITED",
        503: "UNAVAILABLE",
    }

    return JSONResponse(
        status_code=exc.status_code,
        headers=exc.headers,
        content={
            "error": {
                "code": code_by_status.get(
                    exc.status_code,
                    "HTTP_ERROR",
                ),
                "message": (
                    exc.detail
                    if isinstance(exc.detail, str)
                    else "The request could not be completed"
                ),
                "fields": None,
                "request_id": request.headers.get("X-Request-ID"),
            }
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    fields = [
        {
            "field": ".".join(str(part) for part in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        }
        for error in exc.errors()
    ]

    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "One or more request fields are invalid",
                "fields": fields,
                "request_id": request.headers.get("X-Request-ID"),
            }
        },
    )


@app.get("/")
def root():
    return {
        "name": settings.app_name,
        "message": "CineStream API is running",
        "docs": "/docs",
    }


@app.get("/health/live", tags=["health"])
def health_live():
    return {"status": "alive"}


@app.get("/health/ready", tags=["health"])
def health_ready():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError:
        return JSONResponse(
            status_code=503,
            content={
                "error": {
                    "code": "UNAVAILABLE",
                    "message": "A required dependency is unavailable",
                    "fields": None,
                    "request_id": None,
                }
            },
        )

    return {
        "status": "ready",
        "dependencies": {
            "postgresql": "available",
        },
    }
