from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication endpoints
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # JWT token endpoints
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify/', views.verify_token_view, name='verify_token'),
    
    # User profile endpoints
    path('profile/', views.user_profile_view, name='user_profile'),
    path('profile/update/', views.update_profile_view, name='update_profile'),
    path('change-password/', views.change_password_view, name='change_password'),
]
