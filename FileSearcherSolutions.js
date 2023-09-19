// Get Path Names

var getPathNames = (dir) => new Promise(function(res){
	fs.readdir(dir , function(err,files){
		if (err) res([]);
		else res(files.map(x=> `${dir}/${x}`));
	})
})

var getNestedPathNames = async (dir) =>{
	var dirNames = await getPathNames(dir);
	if (dirNames.length === 0) return [];
	var nestedPathPromises = dirNames
		.map(x => getNestedPathNames(x));
	var nestedPath = await Promise.all(nestedPathPromises);
	var newPath =  nestedPath.reduce((prev, curr)=> [...prev,...curr], []);
	return [...dirNames, ...newPath];
}

var readFile = dir => new Promise(ress => fs.readFile(dir,'utf8',(err,data)=>{
	if(err) ress([dir ,'']);
	else ress([dir , data]);
}))

var readFiles = async (dir) => {
	var directories = await getNestedPathNames(dir);
	var txtFiles = directories.filter(x => x.match('.txt'));
	var txtpromises = txtFiles.map(x => readFile(x));
	var arrData = await Promise.all(txtpromises);
	return arrData
}

var search = async (dir, token) => {
	let data = await readFiles(dir);
	let obj = {};
	// filter out lines
	data.forEach((val)=>{
		let [directory, content]= val;
		let lines = [];
		content.split('\n').forEach((x, i)=>{
			if(x.match(token)) lines.push(i); // add lines
		})
		if(lines.length !== 0) obj[directory] = lines;
	});
	return obj;
}
