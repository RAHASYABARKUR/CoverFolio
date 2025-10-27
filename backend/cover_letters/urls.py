from django.urls import path
from . import views

urlpatterns = [
    path('generate/', views.generate_cover_letter, name='generate-cover-letter'),
    path('', views.list_cover_letters, name='list-cover-letters'),
    path('<int:cover_letter_id>/', views.cover_letter_detail, name='cover-letter-detail'),
]
