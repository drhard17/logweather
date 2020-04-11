const fs = require('fs');

module.exports =  {
    toCSV: function(name, temp) {
		let folder = '../csv'

		try {
		if (!fs.existsSync(folder)){
			fs.mkdirSync(folder)
		}
		} catch (err) {
			console.error(err)
		}

		fs.appendFile(`${folder}/${name}.csv`, addDate(temp).toString(), (err) => {
			console.log(err || `${temp} added to ${name}.csv`);
			console.log('')
		});
    },
    
    toConsole: function (name, temp) {
        console.log(`Service: ${name}`)
        console.log(`Temperatures: ${temp.toString()}`)
        console.log('')
    },

    saveHTML: function (name, data) {
		let folder = '../saved-html'

		try {
		if (!fs.existsSync(folder)){
			fs.mkdirSync(folder)
		}
		} catch (err) {
			console.error(err)
		}

        fs.writeFile(`${folder}/${name}.html`, data, (err) => {
            if (err) throw err;
            console.log(`Source page saved to ${name}.html`);
        });
    }

}

function addDate(temps) {
	let d = new Date()
	temps.unshift(`${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`);
	temps.unshift(`${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()}`);
	temps.push('\r\n');
	return temps
}