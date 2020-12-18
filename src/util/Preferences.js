var os = require('os');
const path = require("path");
let default_dir = require(__dirname + '/global_settings').appFolder;

const Preferences = {
	get COM_MOJANG_PATH(){
		// if (default_dir !== '') return default_dir

		// Taken from minecraft-addon-tools/minecraft-addon-toolchain by @AtomicBlom
		let platformRoot = null
		switch (os.platform()) {
			case 'win32':
				platformRoot = path.join(
					process.env['LOCALAPPDATA'],
					'Packages/Microsoft.MinecraftUWP_8wekyb3d8bbwe/LocalState'
				)
				break
			case 'linux':
				platformRoot = path.join(os.homedir(), '.local/share/mcpelauncher')
				break
			case 'darwin':
				platformRoot = path.join(
					os.homedir(),
					'Library/Application Support/mcpelauncher'
				)
				break
			case 'android':
				platformRoot = path.join(os.homedir(), 'storage/shared/')
				break
			default:
				return
		}
		if(platformRoot !== null)
			return platformRoot + '/games/com.mojang'
		return default_dir;
	},

	get CC_PATH(){
		// if (default_dir !== '') return default_dir

		// Taken from minecraft-addon-tools/minecraft-addon-toolchain by @AtomicBlom
		let platformRoot = null
		switch (os.platform()) {
			case 'win32':
				platformRoot = path.join(
					process.env['LOCALAPPDATA'],
					'CoreCoder'
				)
				break
			case 'linux':
				platformRoot = path.join(os.homedir(), '.local/share/CoreCoders')
				break
			case 'darwin':
				platformRoot = path.join(
					os.homedir(),
					'Library/Application Support/CoreCoder'
				)
				break
			case 'android':
				platformRoot = path.join(os.homedir(), 'storage/shared/CoreCoder')
				break
			default:
				return
		}
		if(platformRoot !== null)
			return platformRoot;
		return 'C:\\Program Files'
	},

	get CC_ICON(){
		return `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`;
	}
}