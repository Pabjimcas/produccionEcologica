from django.conf.urls import patterns, include, url
from django.contrib import admin

from mysite.views import Index

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),
	url(r'',include('ecologica.urls', namespace="ecologica")),
)



