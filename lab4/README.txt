Authors: Cathrine Underbjerg Hansen, Marc Bohner

The object a a statue of a face, also known as Moai.

To start with the lab we first wanted to move the camera to see provided object in a better angle.
In order to do that we used the projectionMatrix and the modelViewMatrix.
At the beginning, we just used the perpective projection.
In the lab4.js we added all the variables discussed in the slides like the eue, at, vup, etc. and tried different values to get a good view at the object.

To change between perspective and ortographic projection we added some buttons to the html which call either the code for the orthographic or perspective projection.
As well as for the perspective projection we also used the matrices discussed in the slides to get the orthographic projection.
For the perpective projection we used an symmetric frustum.

After doing that we started to add a point light to the scene.
We used the code from the slides to calculate the light position.
The point light source is implemented including the ambient reflection, diffuse reflection and specular reflection.
To turn each light on and off independently we moved to code of the point light source to a function called light1().

To add the second light source we just copied the code from the first light source and added a cutoff angle and a light direction location.
In the HTML we introduced new variables for the second light to turn it on and off independently.
To turn the second light on and off we used the function light2().

In order to turn off the specular reflection we added a new varible to the HTML file called specularOn which can either be 1 or 0.
We change this variable in the lab4.js file when the button for specular is pressed.

For interpolated shading we used the Gouraud shading.

Instead of using the object.js file we implemented code to import the object.ply file.
As GitHub Copilot is better for developing software, we used it instead of ChatGPT.
It has access to the opened file, so it had access to the whole js code when asking for help.
It was a very simple prompt: how can I change this code so instead of using the object.js file which contains vertices for the object, I can instead use a object.ply file but keep the rest of the code the same?

Copilot then suggested an async function loadPlyModel() which loads an object using the fetch() function.
To get the vertices and indices the loadPlyModel function just loops over every line and adds the corresponding parts to the vertices and indices arrays.
We had to change how the on element of the vertices array looks like because the rest of the code expected it to be vec4, but copilot just added x, y and z.
To add it as a vec4 we just changed the code to vertices.push(vec4(x, y, z, 1.0)).

Also the indices array had an unexpected 0 after each 3 indices, so instead of just 3 indices it added 4 to the indices array.
We changed the code to just use the first 3 indices for each line.

To use the loadPlyModel function we just had to change the code in the init function to call await loadPlyModel() and change the init function to be an async function.
Instead of calling the getVertices() and getFaces() functions of the object.js, we changed it to use the model.vertices and model.indices arrays.

We added a screenshot of the GitHub Copilot prompt to the folder.
The name of it is copilot.png.
