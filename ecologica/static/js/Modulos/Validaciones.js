function validateDNI(dni)
	{
		var lockup = 'TRWAGMYFPDXBNJZSQVHLCKE';
		var valueDni=dni.substr(0,dni.length-1);
		var letra=dni.substr(dni.length-1,1).toUpperCase();

		if(lockup.charAt(valueDni % 23)==letra)
			return true;
		return false;
	};
