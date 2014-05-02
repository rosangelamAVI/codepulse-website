$(function() {
	// if linked directly to a FAQ section, make sure it is shown
	if (location.hash)
		$(location.hash + '.collapse').collapse('show')
})