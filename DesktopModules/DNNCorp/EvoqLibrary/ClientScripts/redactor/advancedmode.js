if (!RedactorPlugins) var RedactorPlugins = {};

RedactorPlugins.advancedmode = {
	init: function()
	{
		this.buttonAdd('advancedmode', this.opts.curLang.advancedEditor, function (){});
	}
};
