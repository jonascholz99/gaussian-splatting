import * as SPLAT from "../dist/index.js"

const canvas = document.getElementById("canvas");
const renderer = new SPLAT.WebGLRenderer(canvas);
const scene = new SPLAT.Scene();
const camera = new SPLAT.Camera();
camera.data.far = 100;
const controls = new SPLAT.OrbitControls(camera, canvas);
const cameraFrustum = new SPLAT.Frustum();

const splatNumber = document.getElementById("splatNumber");
const selectedSplats = document.getElementById("selectedSplats");
const checkbox_select = document.getElementById("toggle-feature");
let splat;

let _intersectionTester = new SPLAT.IntersectionTester();

let renderPrograms = [];
let currentlySelectedSplats = [];
let raycaster;


async function main() 
{    
    var url = "./zw1027_4.splat";
    splat = await SPLAT.Loader.LoadAsync(url, scene);    
 
    splatNumber.innerText = "Max number of splats: " + splat.splatCount;
      
    var octreeProgram = new SPLAT.OctreeHelper(renderer, [],  splat._octree, 1);            
    renderPrograms.push(octreeProgram);
    renderer.addProgram(octreeProgram);

    renderer.addProgram(new SPLAT.AxisProgram(renderer, []));

    const handleResize = () => {
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };

    let splatIndices = [];
    let cameraPosition = camera.position.clone();
    let cameraRotation = camera.rotation.clone();

    const updateFrustum = () => {
        // Update frustum only if the camera has moved
        if (!camera.position.equals(cameraPosition) || !camera.rotation.equals(cameraRotation)) {
            cameraPosition = camera.position.clone;
            cameraRotation = camera.rotation.clone;
            cameraFrustum.setFromProjectionMatrix(camera.data.viewProj);

            const iterator = new SPLAT.OctreeIterator(splat._octree.root, cameraFrustum);
            splat.data.resetRendering();
                
            for (let node of iterator) {        
                const nodeData = node.data;        
                if (nodeData && nodeData.data) {
                    for(let singleSplat of nodeData.data) {                        
                        singleSplat.Rendered = 1;
                    }            
                }
            }                
            splat.applyRendering();
            // splat.position = new SPLAT.Vector3(splat.position.x + 0.1, splat.position.y, splat.position.z);
            // splat.applyPosition();
        }
    };

    const frame = () => {
        controls.update();
        
        renderer.render(scene, camera);

        // Update frustum and extract indices if necessary
        updateFrustum();
       
        // leftCorners = [];
        // rightCorners = [];
        // for(let i = 0; i < result.length; i++) {        
                            
        //     centerCorner1 = new Float32Array([result[i].min.x, result[i].min.y, result[i].min.z]);
        //     centerCorner2 = new Float32Array([result[i].max.x, result[i].max.y, result[i].max.z]);                

        //     leftCorners.push(centerCorner1);
        //     rightCorners.push(centerCorner2);
            
        // }
        // removeAllRenderPrograms();
        // var centerProgram = new SPLAT.MultibleCubesProgram(renderer, [], leftCorners, rightCorners, centerColor);            
        // renderPrograms.push(centerProgram);
        // renderer.addProgram(centerProgram);

        // let points = cameraFrustum.getFrustumPoints();
        // let corners = []
        // for(let i = 0; i < points.length; i++) {
        //     corners.push(new Float32Array([points[i].x, points[i].y, points[i].z]))
        // }
        // removeAllRenderPrograms();

        // var renderProgram = new SPLAT.CubeVisualisationProgram(renderer, [], corners);
        // renderPrograms.push(renderProgram);
        // renderer.addProgram(renderProgram);



        requestAnimationFrame(frame);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    requestAnimationFrame(frame);

    _intersectionTester = new SPLAT.IntersectionTester(renderer.renderProgram, 30, 1);
    raycaster = new SPLAT.Raycaster(renderer, false);
}

main();



document.getElementById('menu-toggle').addEventListener('click', function() {
    updateSelectedSplats();
    const menu = document.getElementById('side-menu');
    if (menu.style.left === '0px') {
        menu.style.left = '-300px';  // Schließen
    } else {
        menu.style.left = '0px';     // Öffnen
    }
});

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//                                         Select all
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
document.getElementById('select-all').addEventListener('click', async function() {    
    document.getElementById('side-menu').style.left = '-300px'; // Menü schließen
    clearSelection();

    splat.splats.forEach(async singleSplat => {        
        singleSplat.Selected = 1;      
        currentlySelectedSplats.push(singleSplat);                       
    })
    splat.applySelection();      
});

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//                                         Select none
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
document.getElementById('select-none').addEventListener('click', async function() {
    document.getElementById('side-menu').style.left = '-300px'; // Menü schließen
    clearSelection();

    splat.splats.forEach(async singleSplat => {        
        singleSplat.Selected = 0;       
    })
    splat.updateRenderingOfSplats();  
});

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//                                      invert selection
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
document.getElementById('invert-seclection').addEventListener('click', async function() {    
    document.getElementById('side-menu').style.left = '-300px'; // Menü schließen

    let tmpList = []    
    splat.splats.forEach(async singleSplat => {        
        if(singleSplat.Selected === 1) {            
            singleSplat.Selected = 0;
        } else {            
            singleSplat.Selected = 1;
            tmpList.push(singleSplat);
        }        
    })
    splat.updateRenderingOfSplats();  
    
    await clearSelection();    
    currentlySelectedSplats = tmpList;    
});

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//                                         show all
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
document.getElementById('show-all').addEventListener('click', async function() {
    document.getElementById('side-menu').style.left = '-300px'; // Menü schließen

    splat.splats.forEach(async singleSplat => {        
        singleSplat.Rendered = 1;       
    })
    splat.updateRenderingOfSplats();      
});

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//                                         show none
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
document.getElementById('show-none').addEventListener('click', async function() {
    document.getElementById('side-menu').style.left = '-300px'; // Menü schließen

    splat.splats.forEach(async singleSplat => {        
        singleSplat.Rendered = 0;               
    })
    splat.updateRenderingOfSplats();      
});

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//                                    render selected splats
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
document.getElementById('render-selected-splats').addEventListener('click', function() {    
    document.getElementById('side-menu').style.left = '-300px'; // Menü schließen

    splat.splats.forEach(async singleSplat => {        
        singleSplat.Rendered = 0;               
    })
    currentlySelectedSplats.forEach(singleSplat => {
        singleSplat.Rendered = 1;               
    })
    splat.updateRenderingOfSplats();   
});

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//                                    render except selected
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
document.getElementById('render-unselected-splats').addEventListener('click', async function() {    
    document.getElementById('side-menu').style.left = '-300px'; // Menü schließen

    splat.splats.forEach(async singleSplat => {        
        singleSplat.Rendered = 1;               
    })
    currentlySelectedSplats.forEach(singleSplat => {
        singleSplat.Rendered = 0;               
    })
    splat.updateRenderingOfSplats();     
});

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//                                    render center selected
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
document.getElementById('render-center-splats').addEventListener('click', async function() {   
    removeAllRenderPrograms(); 
    document.getElementById('side-menu').style.left = '-300px'; // Menü schließen

    var leftCorners = []
    var rightCorners = []
    let centerColor = new Float32Array([1.0, 1.0, 0.0, 0.6]);
    currentlySelectedSplats.forEach(singleSplat => {
        let bounds = singleSplat.bounds;           
                        
        let centerCorner1 = new Float32Array([bounds.center().x-0.05, bounds.center().y-0.05, bounds.center().z-0.05]);
        let centerCorner2 = new Float32Array([bounds.center().x+0.05, bounds.center().y+0.05, bounds.center().z+0.05]);                

        leftCorners.push(centerCorner1);
        rightCorners.push(centerCorner2);
        
    })    
    var centerProgram = new SPLAT.MultibleCubesProgram(renderer, [], leftCorners, rightCorners, centerColor);            
    renderPrograms.push(centerProgram);
    renderer.addProgram(centerProgram);
});


document.getElementById('start-show-splats').addEventListener('click', function() {
    clearSelection();

    const splatCount = parseInt(document.getElementById('number-splats').value, 10);
    

    document.getElementById('side-menu').style.left = '-300px'; // Menü schließen
    for (let i = 0; i < splatCount; i++) {        
        splat.selectSplat(i, true);                
        
        currentlySelectedSplats.push(splat.splats[i]);                      
    }
    splat.updateRenderingOfSplats();
    console.log(splat._data.selection)
});


document.getElementById('select-splats').addEventListener('click', function() {
    clearSelection();    

    document.getElementById('side-menu').style.left = '-300px'; // Menü schließen
    
    var layerValue = document.getElementById('layer-value').value;
    var isPositive = document.getElementById('toggle-feature-pos-neg').checked;
    var selectedAxis = document.getElementById('axis-select').value;

    var selectedSplat = _intersectionTester.testLayer(layerValue, isPositive, selectedAxis);

    if (selectedSplat !== null){            
        selectedSplat.forEach(singleSplat => {
            singleSplat.Selected = 1
            currentlySelectedSplats.push(singleSplat);
        });        
        splat.updateRenderingOfSplats();      
    } 

});



document.getElementById('select-splats-mouse').addEventListener('click', function() {
    clearSelection();

    document.getElementById('side-menu').style.left = '-300px'; // Menü schließen
    addMouseListener();
});

function removeMouseListener() {
    document.removeEventListener('mouseup', handleMouseDown, true);
}

function addMouseListener() {
    document.addEventListener('mouseup', handleMouseDown, true);
}

function handleMouseDown(event) {
    if (event.button === 0) {
        const x = (event.clientX / canvas.clientWidth) * 2 - 1;
        const y = -(event.clientY / canvas.clientHeight) * 2 + 1;
                
        console.log("mouse Position: (" + x + " ; " + y + ")")
        var selectedSplat = _intersectionTester.testPointSingleSplats(x, y);
                
        if (selectedSplat !== null){            
            selectedSplat.forEach(singleSplat => {
                singleSplat.Selected = 1;
                currentlySelectedSplats.push(singleSplat);          
            });        
            splat.updateRenderingOfSplats();      
        } 

        removeMouseListener();
    }
}

document.getElementById("show-splats-camera-frustum").addEventListener("click", function() {
    clearSelection();
    document.getElementById('side-menu').style.left = '-300px'; // Menü schließen

    var selectedSplat = raycaster.testCameraViewFrustum(camera);
    if (selectedSplat !== null){ 
        console.log("found: " + selectedSplat.length)           
        selectedSplat.forEach(singleSplat => {
            singleSplat.Selected = 1
            currentlySelectedSplats.push(singleSplat);              
        });        
        splat.updateRenderingOfSplats();      
    } 

    setTimeout(function() {
        renderer.removeAllPrograms();
    }, 9000); 

    setTimeout(function() {
        clearSelection();

        splat.splats.forEach(async singleSplat => {        
            singleSplat.Selected = 0;
        })
        splat.updateRenderingOfSplats();  
    }, 5500); 

    setTimeout(function() {
        splat.splats.forEach(async singleSplat => {        
            singleSplat.Rendered = 0;
        })
        currentlySelectedSplats.forEach(singleSplat => {
            singleSplat.Rendered = 1;
        })
        splat.updateRenderingOfSplats(); 
    }, 5000);     
});

document.getElementById("select-splats-camera-frustum").addEventListener("click", function() {
    clearSelection();
    document.getElementById('side-menu').style.left = '-300px'; // Menü schließen

    splat.data.resetRendering();
    const iterator = new SPLAT.OctreeIterator(splat._octree.root, cameraFrustum);

    // let points = cameraFrustum.getFrustumPoints();
    // let corners = []
    // for(let i = 0; i < points.length; i++) {
    //     corners.push(new Float32Array([points[i].x, points[i].y, points[i].z]))
    // }
    // removeAllRenderPrograms();

    // var renderProgram = new SPLAT.CubeVisualisationProgram(renderer, [], corners);
    // renderPrograms.push(renderProgram);
    // renderer.addProgram(renderProgram);

    let first = true;
    for (let node of iterator) {        
        const nodeData = node.data;        
        if (nodeData && nodeData.data) {
            for(let singleSplat of nodeData.data) {
                if(first) {
                    first = false;
                    console.log(singleSplat)
                }
                singleSplat.Rendered = 1;
            }            
        }
    }    
    splat.applySelection();
    
    // var selectedSplat = raycaster.testCameraViewFrustum(camera, true, 5);
    // if (selectedSplat !== null){ 
    //     console.log("found: " + selectedSplat.length)           
    //     selectedSplat.forEach(singleSplat => {
    //         singleSplat.Selected = 1;
    //         currentlySelectedSplats.push(singleSplat);              
    //     });        
    //     splat.updateRenderingOfSplats();      
    // } 

});

document.getElementById("select-splats-cube").addEventListener("click", function() {
    clearSelection();
    document.getElementById('side-menu').style.left = '-300px'; // Menü schließen
    
    removeAllRenderPrograms();

    const x1 = parseFloat(document.getElementById('vecX_uc').value);
    const y1 = parseFloat(document.getElementById('vecY_uc').value);
    const z1 = parseFloat(document.getElementById('vecZ_uc').value);

    const x2 = parseFloat(document.getElementById('vecX_lc').value);
    const y2 = parseFloat(document.getElementById('vecY_lc').value);
    const z2 = parseFloat(document.getElementById('vecZ_lc').value);

    let color = new Float32Array([1.0, 1.0, 0.0, 0.6]);

    let upperLeftCorner = new Float32Array([x1, y1, z1]);
    let bottomRightCorner = new Float32Array([x2, y2, z2]);

    var renderProgram = new SPLAT.CubeVisualisationProgram(renderer, [], [upperLeftCorner, bottomRightCorner], color);
    renderPrograms.push(renderProgram);
    renderer.addProgram(renderProgram);

    let min = new SPLAT.Vector3(x1, y1, z1);
    let max = new SPLAT.Vector3(x2, y2, z2);
    let testBox = new SPLAT.Box3(min,max);
    var result = splat._octree.cull(testBox);

    let numberOfPoints = 0
    for(let j = 0; j < result.length; j++) {        
        if(result[j] instanceof SPLAT.PointOctant) {
            numberOfPoints = splat._octree.countPoints(result[j]);
            console.log("Points in node " + j + ": " + numberOfPoints);
        }
        if(numberOfPoints > 0) {
            for(let i = 0; i < result[j].data.data.length; i++) {
                let index = result[j].data.data[i];
                splat.selectSplat(index,1);        
            }
        }                
    }    
    splat.updateRenderingOfSplats();    
    
    var leftCorners = []
    var rightCorners = []    
    let centerColor = new Float32Array([1.0, 0.0, 0.0, 0.1]);
    for(let i = 0; i < result.length; i++) {        
        
        let min = result[i].min;
        let max = result[i].max;
                        
        let centerCorner1 = new Float32Array([min.x, min.y, min.z]);
        let centerCorner2 = new Float32Array([max.x, max.y, max.z]);                

        leftCorners.push(centerCorner1);
        rightCorners.push(centerCorner2);
        
    }
    var centerProgram = new SPLAT.MultibleCubesProgram(renderer, [], leftCorners, rightCorners, centerColor);            
    renderPrograms.push(centerProgram);
    renderer.addProgram(centerProgram);

    console.log(result[0]);

    var selectedSplat = raycaster.testBox(upperLeftCorner, bottomRightCorner);
    if (selectedSplat !== null){ 
        console.log("found: " + selectedSplat.length)           
        selectedSplat.forEach(singleSplat => {
            singleSplat.Selected = 1;
            currentlySelectedSplats.push(singleSplat);              
        });        
        splat.updateRenderingOfSplats();      
    } 

    setTimeout(function() {
        removeAllRenderPrograms();  
    }, 10000); 
})

document.getElementById("set-transparency").addEventListener("click", function() {

    console.log(splat.splats[0].Color)
    splat.splats.forEach(async singleSplat => {                
        let color = new Uint8Array([singleSplat.Color[0], singleSplat.Color[1], singleSplat.Color[2], 5]);
        singleSplat.Color = color;      
    })
    splat.updateRenderingOfSplats();  
})

document.getElementById("Reset-transparency").addEventListener("click", function() {
    
    splat.splats.forEach(async singleSplat => {                        
        singleSplat.ResetColor();  
    })    
    splat.updateRenderingOfSplats();  
})

function removeAllRenderPrograms() {
    for(let i = 0; i < renderPrograms.length; i++) {
        var program = renderPrograms.pop();
        renderer.removeProgram(program)
    }
}

function updateSelectedSplats() {
    selectedSplats.innerText = "currently selected: " + currentlySelectedSplats.length + " splats";
}

async function clearSelection() {
    currentlySelectedSplats.forEach(singleSplat => {
        singleSplat.Select = 0             
    })
    splat.updateRenderingOfSplats();  

    currentlySelectedSplats.splice(0, currentlySelectedSplats.length);
}