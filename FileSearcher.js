const fs = require('fs');

function getPathNames(dir)
{
	return new Promise((resolve, reject) =>
  {
    fs.readdir(dir, (error, files) =>
    {
      if (error)
        resolve([]);
      else
        resolve(files);
    });
  });
}

async function getNestedPathNames(dir)
{
	var currPaths = await getPathNames(dir);

	return new Promise(async (resolve, reject) =>
	{
		if (currPaths === [])
			resolve([]);
		else
		{
			var promiseList = new Array();

			currPaths.forEach(path => promiseList.push(getNestedPathNames(path)));

			var newPaths = await Promise.all(promiseList);

			currPaths.push(...newPaths);
			currPaths = currPaths.reduce((prev, curr) => prev.concat(curr), []);
			resolve(currPaths);
		}
	});
}

async function readFiles(dir)
{
  var filePaths = await getNestedPathNames(dir);
  console.log(filePaths);
  async function promise(filePath)
  {
    return new Promise((resolve, reject) =>
    {
      fs.readFile(filePath, 'utf8', (err, data) =>
      {
        if (err)
          resolve([]);
        else
          resolve([filePath, data]);
      });
    });
  }

  var promiseList = new Array();

  filePaths.forEach(path =>
  {
    if (path.endsWith('.txt'))
      promiseList.push(promise(path));
  });

  var retVal = await Promise.all(promiseList);

  return retVal;
}

async function search(dir, token)
{
    var files = await readFiles(dir);

    function promise(file)
    {
        return new Promise(resolve =>
        {
            var arr = file[1].split('\n');
            var lineNumbers = new Array();

            arr.forEach((line, ind) =>
            {
                if (line.includes(token))
                    lineNumbers.push(ind);
            });

            resolve(lineNumbers);
        });
    }

    var promiseList = new Array();

    files.forEach(file => promiseList.push(promise(file)));

    var appearances = await Promise.all(promiseList);
    var obj = new Object();

    appearances.forEach((arr, ind) =>
    {
        if (arr.length !== 0)
            obj[files[ind][0]] = arr;
    });

	return obj;
}
