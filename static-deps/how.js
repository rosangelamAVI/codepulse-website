(function() {
	function setStep(id) {
		$('#how-list li[data-step != "' + id + '"]').removeClass('active')
		$('#how-list li[data-step = "' + id + '"]').addClass('active')

		$('#how-steps .step:not(#' + id + ')').removeClass('active')
		$('#how-steps #' + id).addClass('active')
	}

	$(function() {
		// select the first step automatically
		setStep($('#how-steps .step:first').attr('id'))

		// on mouse enter, change step
		$('#how-list li[data-step]').mouseenter(function() {
			var step = $(this).data('step')
			setStep(step)
		})
	})
})()