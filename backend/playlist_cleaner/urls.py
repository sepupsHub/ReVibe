from django.urls import path
from .views import FetchPlaylistsView 

urlpatterns = [
    path("duplicates/", FetchPlaylistsView.as_view())
]