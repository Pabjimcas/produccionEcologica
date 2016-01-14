from django import template
register = template.Library()

@register.filter
def index(List, id):
	cont = 1
	for el in List:
		if el.id == id:
			break
		cont = cont + 1
	return cont