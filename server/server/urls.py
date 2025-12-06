from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

sitemaps = {}

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api-auth/", include("rest_framework.urls")),
    path(
        "api/",
        include(
            [
                path(
                    "schema/",
                    include(
                        [
                            path(
                                "",
                                SpectacularAPIView.as_view(),
                                name="schema",
                            ),
                            path(
                                "swagger/",
                                SpectacularSwaggerView.as_view(url_name="schema"),
                                name="swagger-ui",
                            ),
                            path(
                                "redoc/",
                                SpectacularRedocView.as_view(url_name="schema"),
                                name="redoc",
                            ),
                        ],
                    ),
                ),
                path("accounts/", include("accounts.urls")),
            ]
        ),
    ),
    path("sitemap.xml", sitemap, {"sitemaps": sitemaps}),
]

handler500 = "rest_framework.exceptions.server_error"
handler400 = "rest_framework.exceptions.bad_request"
