/**
* @author: Maher Samawi
* Citations: Used the terrainModeling.js file as a the starter for this mp
*
**/
/**
 * Iteratively generate terrain from numeric inputs
 * @param {number} n
 * @param {number} minX Minimum X value
 * @param {number} maxX Maximum X value
 * @param {number} minY Minimum Y value
 * @param {number} maxY Maximum Y value
 * @param {Array} vertexArray Array that will contain vertices generated
 * @param {Array} faceArray Array that will contain faces generated
 * @param {Array} normalArray Array that will contain normals generated
 * @return {number}
 */
function terrainFromIteration(n, minX,maxX,minY,maxY, vertexArray, faceArray,normalArray)
{
    var deltaX=(maxX-minX)/n;
    var deltaY=(maxY-minY)/n;
    for(var i=0;i<=n;i++)
       for(var j=0;j<=n;j++)
       {
           vertexArray.push(minX+deltaX*j);
           vertexArray.push(minY+deltaY*i);
           vertexArray.push(0);
           
           normalArray.push(0);
           normalArray.push(0);
           normalArray.push(1);
       }

    var numT=0;
    for(var i=0;i<n;i++)
       for(var j=0;j<n;j++)
       {
           var vid = i*(n+1) + j;
           faceArray.push(vid);
           faceArray.push(vid+1);
           faceArray.push(vid+n+1);
           
           faceArray.push(vid+1);
           faceArray.push(vid+1+n+1);
           faceArray.push(vid+n+1);
           numT+=2;
       }
    console.log("Vertex Array")
    console.log(vertexArray);
    
    // Create 2D array for height map
    var heightMap = new Array();
    for (i = 0; i < n; i++) {
      heightMap[i] = new Array();
      for (j = 0 ; j < n; j++) {
        heightMap[i][j] = 0;
      }
    }
    console.log("n is", n);
    var random_range = 2;
    generateDiamondSquare(heightMap, 0, 0, n, n, random_range, n);

    // Create the mapping from the z coordinates in the vertex array to the height map
    // Divide by 2.5 since the heightMap z coordinate goes outside the boundaries of the image and makes it look better
    for(var i = 0; i < n; i++){
      for(var j = 0; j< n; j++){
        vertexArray[(((i * 3) * (n + 1) + (j * 3)) + 2)] = heightMap[i][j] / 2.5;
      }
    }
    console.log(faceArray);
    //setupNormals(vertexArray, faceArray, normalArray);
    //console.log(heightMap);
    return numT;
}
/**
 * Citations: https://gamedev.stackexchange.com/questions/37389/diamond-square-terrain-generation-problem
 * Recursive function that creates the terrain using the diamond square algorithm
 * @param {Array}  heightMap 2-D array that will store the new Z coordinate values for the terrain
 * @param {number} minX Minimum X value
 * @param {number} minY Minimum Y value
 * @param {number} maxX Maximum X value
 * @param {number} maxY Maximum Y value
 * @param {number} range The number that will multiplied by the random number to create the range. Decreases every call
 * @param {number} depth The number of times this function will recurse
 * @return {Nothing}
 */
 //
function generateDiamondSquare(heightMap, minX, minY, maxX, maxY, range, depth){
  // Base Case
  if (depth < 1){
    return;
  }
  var posNegArray = [-1, 1, -2, 2];
  console.log(depth);
  // Diamond Part
  var i = i = minX + depth;
  while ( i < maxX){
    var j = minY + depth;
    while (j < maxY){
      var first = heightMap[i - depth][j - depth];
      var second = heightMap[i][j - depth];
      var third = heightMap[i - depth][j];
      var fourth = heightMap[i][j];
      
      var posNeg = posNegArray[Math.floor(Math.random()*posNegArray.length)];
      var avgWithRandomNumber = ((first + second + third + fourth) / 4 ) + (Math.random() * range * posNeg);
      heightMap[i - Math.floor(depth / 2)][j - Math.floor(depth / 2)] = avgWithRandomNumber;
      j += depth;
    }
    i += depth;
  }
  // Square Part
  i = minX + 2 * depth;
  while(i < maxX){
    var j = minY + 2 * depth;
    while(j < maxY){
      var first = heightMap[i - depth][j - depth];
      var second = heightMap[i][j - depth];
      var third = heightMap[i - depth][j];
      var fourth = heightMap[i][j];
      var fifth = heightMap[i - Math.floor(depth / 2)][j - Math.floor(depth / 2)];

      var posNeg = posNegArray[Math.floor(Math.random()*posNegArray.length)];
      var a = heightMap[i - 3 * Math.floor(depth / 2)][j - Math.floor(depth / 2)];
      var b = heightMap[i - Math.floor(depth / 2)][j - 3 * Math.floor(depth / 2)];
      var avgWithRandomNumber1 = ((first + third + fifth + a) / 4) +  (Math.random() * range * posNeg);
      var avgWithRandomNumber2 = ((first + second + fifth + b) / 4) + (Math.random() * range * posNeg);
      heightMap[i - depth][j - Math.floor(depth / 2)] = avgWithRandomNumber1;
      heightMap[i - Math.floor(depth / 2)][j - depth] = avgWithRandomNumber2;
      j+= depth
    }
    i += depth;
  }
  // Recurse
  generateDiamondSquare(heightMap, minX, minY, maxX, maxY, range/2, depth/2);
}

function setupNormals(vertexArray, faceArray, normalArray){
  for ( var i = 0; i < vertexArray; i+=3){
    var v1 = vec3.fromValues(vertexArray[i], vertexArray[i + 1] , vertexArray[i + 2]);

    vec3.normalize(v1,v1);
    normalArray[i]     = v1[0];
    normalArray[i + 1] = v1[1];
    normalArray[i + 2] = v1[2];
  }
}

/**
 * Generates line values from faces in faceArray
 * @param {Array} faceArray array of faces for triangles
 * @param {Array} lineArray array of normals for triangles, storage location after generation
 */
function generateLinesFromIndexedTriangles(faceArray,lineArray)
{
    numTris=faceArray.length/3;
    for(var f=0;f<numTris;f++)
    {
        var fid=f*3;
        lineArray.push(faceArray[fid]);
        lineArray.push(faceArray[fid+1]);
        
        lineArray.push(faceArray[fid+1]);
        lineArray.push(faceArray[fid+2]);
        
        lineArray.push(faceArray[fid+2]);
        lineArray.push(faceArray[fid]);
    }
}

