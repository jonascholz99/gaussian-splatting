import * as SPLAT from "../../dist/index.js"

const canvas = document.getElementById("canvas");
const renderer = new SPLAT.WebGLRenderer(canvas);
const scene = new SPLAT.Scene();
const camera = new SPLAT.Camera();
camera.data.far = 100;
const controls = new SPLAT.OrbitControls(camera, canvas);
const cameraFrustum = new SPLAT.Frustum();
const boxFrustum = new SPLAT.Frustum();

const splatNumber = document.getElementById("splatNumber");
const selectedSplats = document.getElementById("selectedSplats");
const checkbox_select = document.getElementById("toggle-feature");
let splat;

let loaderOverlay = document.getElementById('loader-overlay');

let _intersectionTester = new SPLAT.IntersectionTester();

let renderPrograms = [];
let currentlySelectedSplats = [];
let raycaster;

let octreeRenderProgram; 
let originRenderProgram;

let cullByCameraFrustum = false;
let currentRing1 = null;
let currentRing2 = null;
let currentRectangle = null;

let exactMasking = false;
let transparency_threshold = 2;

let blend_value = 1;

const MouseUsage = {
    NONE: 'none',
    SELECT: 'select',
    DIMINSIH: 'diminish'
};

let currentMouseUsage = MouseUsage.NONE;

let initialCenter; 
let initialSize; 

function setMouseUsage(usage) {
    if (Object.values(MouseUsage).includes(usage)) {
        currentMouseUsage = usage;
    } else {
        throw new Error('Invalid status value');
    }
}

function showControlPanel() {
    document.getElementById('control-panel').style.bottom = '60px';
}

function hideControlPanel() {
    document.getElementById('control-panel').style.bottom = '-100%';
}

let controlPanelHeader = document.getElementById('control-panel-header');
let leftControlHeader = document.getElementById('left-control-header');
let rightControlHeader = document.getElementById('right-control-header');

document.getElementById('x-position').oninput = function() {
    updateValue('x-position-value', this.value);
};
document.getElementById('y-position').oninput = function() {
    updateValue('y-position-value', this.value);
};
document.getElementById('z-position').oninput = function() {
    updateValue('z-position-value', this.value);
};

document.getElementById('x-scaling').oninput = function() {
    updateValue('x-scaling-value', this.value);
};
document.getElementById('y-scaling').oninput = function() {
    updateValue('y-scaling-value', this.value);
};
document.getElementById('z-scaling').oninput = function() {
    updateValue('z-scaling-value', this.value);
};

let controlPanelUsage = 'NONE';

function updateValue(id, value) {
    document.getElementById(id).textContent = value;

    if(controlPanelUsage === 'SELECTION') {
        updateCube();   
    } else if(controlPanelUsage === 'SCENE') {
        updateScene();
    }
}

function updateControlPanelSlider() {    
    const sliderXPosition = document.getElementById('x-position');
    const sliderYPosition = document.getElementById('y-position');
    const sliderZPosition = document.getElementById('z-position');

    const sliderXRotation = document.getElementById('x-scaling');
    const sliderYRotation = document.getElementById('y-scaling');
    const sliderZRotation = document.getElementById('z-scaling');

    if(controlPanelUsage === 'SELECTION') {
        updateCube();   
    } else if(controlPanelUsage === 'SCENE') {
        sliderXPosition.min = -3;
        sliderXPosition.max = 3;
        sliderXPosition.step = 0.01;
        sliderXPosition.value = 0;

        sliderYPosition.min = -3;
        sliderYPosition.max = 3;
        sliderYPosition.step = 0.01;
        sliderYPosition.value = 0;

        sliderZPosition.min = -3;
        sliderZPosition.max = 3;
        sliderZPosition.step = 0.01;
        sliderZPosition.value = 0;


        sliderXRotation.min = -2;
        sliderXRotation.max = 2;
        sliderXRotation.step = 0.01;
        sliderXRotation.value = 0;

        sliderYRotation.min = -2;
        sliderYRotation.max = 2;
        sliderYRotation.step = 0.01;
        sliderYRotation.value = 0;

        sliderZRotation.min = -2;
        sliderZRotation.max = 2;
        sliderZRotation.step = 0.01;
        sliderZRotation.value = 0;
    }
}

let splatPosition;
let splatRotation;
function updateScene() {
    const xPosition = parseFloat(document.getElementById('x-position').value);
    const yPosition = parseFloat(document.getElementById('y-position').value);
    const zPosition = parseFloat(document.getElementById('z-position').value);
    
    const xRotation = parseFloat(document.getElementById('x-scaling').value);
    const yRotation = parseFloat(document.getElementById('y-scaling').value);
    const zRotation = parseFloat(document.getElementById('z-scaling').value);

    splatPosition = new SPLAT.Vector3(xPosition, yPosition, zPosition);
    splatRotation = SPLAT.Quaternion.FromEuler(new SPLAT.Vector3(xRotation, yRotation, zRotation));
    

    splat.position = splatPosition;        
    splat.rotation = splatRotation;
}

function updateCube() {
    const xPosition = parseFloat(document.getElementById('x-position').value);
    const yPosition = parseFloat(document.getElementById('y-position').value);
    const zPosition = parseFloat(document.getElementById('z-position').value);
    
    const xScaling = parseFloat(document.getElementById('x-scaling').value);
    const yScaling = parseFloat(document.getElementById('y-scaling').value);
    const zScaling = parseFloat(document.getElementById('z-scaling').value);

    // Verschieben der Box
    boxObject.ereaseBox(renderer);
    
    const newCenter = initialCenter.add(new SPLAT.Vector3(xPosition, yPosition, zPosition));    
    const newSize = new SPLAT.Vector3(initialSize.x * xScaling, initialSize.y * yScaling, initialSize.z * zScaling);

    const halfSize = newSize.divide(2);    
    const newMin = newCenter.subtract(halfSize);    
    const newMax = newCenter.add(halfSize);    
    
    boxObject.min = newMin;
    boxObject.max = newMax;

    boxObject.drawBox(renderer)
}

// helper functions
function isWithinTolerance(value1, value2, tolerance) {
    return Math.abs(value1 - value2) <= Math.abs(value1 * tolerance);
}

function positionsAreClose(position1, position2, tolerance) {
    return isWithinTolerance(position1.x, position2.x, tolerance) &&
           isWithinTolerance(position1.y, position2.y, tolerance) &&
           isWithinTolerance(position1.z, position2.z, tolerance);
}

function rotationsAreClose(rotation1, rotation2, tolerance) {
    return isWithinTolerance(rotation1.x, rotation2.x, tolerance) &&
           isWithinTolerance(rotation1.y, rotation2.y, tolerance) &&
           isWithinTolerance(rotation1.z, rotation2.z, tolerance);
}

let cameraPosition = camera.position.clone();
let cameraRotation = camera.rotation.clone();
const tolerance = 0.1; // 10% Toleranz

async function main() 
{        
    var url = "./zw1027_4.splat";    
    splat = await SPLAT.Loader.LoadAsync(url, scene);            

    splatNumber.innerText = "Max number of splats: " + splat.splatCount;                       

    const handleResize = () => {
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };

    let splatIndices = [];
    
        
    const updateFrustum = () => {
        //Update frustum only if the camera has moved
        if (!positionsAreClose(camera.position, cameraPosition, tolerance) || !rotationsAreClose(camera.rotation, cameraRotation, tolerance)) {            
            // oneTime = false;
            cameraPosition = camera.position.clone();
            cameraRotation = camera.rotation.clone();

            let minX = -1, minY = -1;
            let maxX = 1, maxY = 1;             
            
            nearTopLeft = camera.screenToWorldPoint(minX, maxY);
            nearBottomRight = camera.screenToWorldPoint(maxX, minY);
            nearTopRight = camera.screenToWorldPoint(maxX, maxY);
            nearBottomLeft = camera.screenToWorldPoint(minX, minY);

            farTopLeft = nearTopLeft.add(camera.screenPointToRay(minX, maxY).multiply(camera.data.far));
            farTopRight = nearTopRight.add(camera.screenPointToRay(maxX, maxY).multiply(camera.data.far));
            farBottomLeft = nearBottomLeft.add(camera.screenPointToRay(minX, minY).multiply(camera.data.far));
            farBottomRight = nearBottomRight.add(camera.screenPointToRay(maxX, minY).multiply(camera.data.far));            

            // cameraFrustum.ereaseFrustum(renderer);
            cameraFrustum.setFromPoints(nearTopLeft, nearTopRight, nearBottomLeft, nearBottomRight, farTopLeft, farTopRight,farBottomLeft, farBottomRight);            
            // cameraFrustum.drawFrustum(renderer);

            // const iterator = new SPLAT.OctreeIterator(.root, cameraFrustum);   
            
            const nodes = splat._octree.cull(cameraFrustum);                                

            splat.data.resetRendering();                           

            nodes.forEach(node => {  
                let nodeData = node.data;                              
                if (nodeData && nodeData.data) {     
                    for(let singleSplat of nodeData.data) {                                 
                        singleSplat.Rendered = 1;                        
                    }           
                }
            });
            
                                        
            splat.applyRendering();
            
        }
        // splat.position = new SPLAT.Vector3(splat.position.x + 1.0, splat.position.y, splat.position.z);
        //     splat.applyPosition();
    };

    let frameCounter = 0;
    const updateInterval = 5;
    let firstFrame = true;    
    let oneTime = true;

    const frame = () => {
        if(firstFrame) {
            firstFrame = false;
            loaderOverlay.style.display = 'none';
        }

        controls.update();
        
        renderer.render(scene, camera);

        
        // Update frustum and extract indices if necessary
        if (cullByCameraFrustum && frameCounter % updateInterval === 0 && oneTime) {            
            updateFrustum();        
        }       

        if(cullByCube && frameCounter % updateInterval === 0) {
            updateBoxFrustum();
        }
        frameCounter++;
        requestAnimationFrame(frame);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    requestAnimationFrame(frame);

    _intersectionTester = new SPLAT.IntersectionTester(renderer.renderProgram, 30, 1);
    raycaster = new SPLAT.Raycaster(renderer, false);
}

main();


document.getElementById('toggle-button').addEventListener('click', function() {
    const panel = document.getElementById('controlPanel');
    panel.classList.toggle('open');    
});

document.getElementById('checkbox').addEventListener('change', function() {
    const checkbox = document.getElementById('checkbox');    
    const slider = document.getElementById('slider');
    
    const level = parseInt(slider.value, 10);

    if(checkbox.checked) {
        octreeRenderProgram = new SPLAT.OctreeHelper(renderer, [],  splat.octree, level);          
        renderer.addProgram(octreeRenderProgram); 
    } else {
        renderer.removeProgram(octreeRenderProgram)
    }
});

let nodeBox;

document.getElementById('childrenOf').addEventListener('change', function() {
    if(nodeBox) {
        nodeBox.ereaseBox(renderer);
    }    

    let value = parseInt(document.getElementById('childrenOf').value);    
    
    const slider = document.getElementById('slider');
    
    const level = parseInt(slider.value, 10);

    let levelChildCount = splat.octree.findNodesByLevel(level).length
    
    if(value < 0) {
        value = 0;
        document.getElementById('childrenOf').value = value;
    } else if(value >= levelChildCount) {
        value = levelChildCount-1;
        document.getElementById('childrenOf').value = levelChildCount-1;
    }

    splat.data.resetRendering();
    splat.splats.forEach(async singleSplat => {        
        singleSplat.Selected = 0;       
    })

    let node = splat.octree.findNodesByLevel(level)[value];
    nodeBox = new SPLAT.Box3(node.min, node.max);

    let allNodes = splat.octree.cull(nodeBox);
    allNodes.forEach(node => {
        let nodeData = node.data
        if(nodeData) {
            let splatArray = nodeData.data;
            if(splatArray) {                
                splatArray.forEach(singleSplat => {
                    if(nodeBox.contains(singleSplat.PositionVec3)) {
                        singleSplat.Selected = 1;
                        singleSplat.Rendered = 1;
                    }                    
                });
            }            
        }
    });    
    splat.applyRendering();

    nodeBox.drawBox(renderer, new SPLAT.Vector4(1.0, 1.0, 1.0, 0.1), new SPLAT.Vector4(1.0, 0.0, 0.0, 1.0));
});

document.getElementById('checkbox-masking').addEventListener('change', function() {
    const checkbox = document.getElementById('checkbox-masking');    
    exactMasking = checkbox.checked;
    console.log(exactMasking)
});


document.getElementById('checkbox-origin').addEventListener('change', function() {
    const checkbox = document.getElementById('checkbox-origin');    
    if(checkbox.checked) {
        originRenderProgram = new SPLAT.AxisProgram(renderer, []);
        renderer.addProgram(originRenderProgram); 

        let grid = new SPLAT.GridProgram(renderer, []);
        renderer.addProgram(grid); 
    } else {
        renderer.removeProgram(originRenderProgram)
    }
});

document.getElementById('slider-transparency').addEventListener('input', function() {
    const slider = document.getElementById('slider-transparency');
    
    transparency_threshold = slider.value;    
});

document.getElementById('slider').addEventListener('input', function() {
    const slider = document.getElementById('slider');
    slider.min = 0;
    slider.max = splat.octree.getMaxDepth();

    const level = parseInt(slider.value, 10);

    if(octreeRenderProgram !== undefined) {
        renderer.removeProgram(octreeRenderProgram)
    }
    octreeRenderProgram = new SPLAT.OctreeHelper(renderer, [],  splat.octree, level);  
    renderer.addProgram(octreeRenderProgram); 
});



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
//                                    Cull Camera Frustum
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
document.getElementById('cull-camera-frustum').addEventListener('click', async function() {
    document.getElementById('side-menu').style.left = '-300px'; // Menü schließen

    cullByCameraFrustum = !cullByCameraFrustum;
    if(!cullByCameraFrustum) {
        splat.splats.forEach(async singleSplat => {        
            singleSplat.Rendered = 1;       
        })
        splat.applyRendering();
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
    splat.applyRendering();
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
    splat.applyRendering();      
});

// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//                                         show none
// :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
document.getElementById('show-none').addEventListener('click', async function() {
    document.getElementById('side-menu').style.left = '-300px'; // Menü schließen

    splat.splats.forEach(async singleSplat => {        
        singleSplat.Rendered = 0;               
    })
    splat.applyRendering();      
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
    splat.applyRendering();   
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
    splat.applyRendering();
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

document.getElementById('start-transform').addEventListener('click', function() {    
    controlPanelHeader.innerText = "Transform Scene"; 
    leftControlHeader.innerText = "Position";
    rightControlHeader.innerText = "Rotation";

    controlPanelUsage = "SCENE";

    splatPosition = splat.position;
    splatRotation = splat.rotation;    

    updateControlPanelSlider();

    showControlPanel();
});

document.getElementById('start-diminish').addEventListener('click', function() {    
    document.getElementById('side-menu').style.left = '-300px'; 
    const floatingButton = document.getElementById('floatingButton');
    floatingButton.textContent = "Maskieren beginnen";
    floatingButton.style.bottom = '20px'; // Animate button to fly in
    setMouseUsage(MouseUsage.DIMINSIH);
    addMouseListener();
});

document.getElementById('floatingButton').addEventListener('click', function() {    
    const floatingButton = document.getElementById('floatingButton');
    floatingButton.style.bottom = '-100px';
    if(floatingButton.textContent === "Diminish") {
        cullByCube = true;
        boxObject.ereaseBox(renderer);
        floatingButton.textContent = "Neu Maskieren"
        floatingButton.style.bottom = '20px';

    } else if(floatingButton.textContent == "Neu Maskieren") {
        cullByCube = false;
        boxObject = null;
        splat.splats.forEach(async singleSplat => {        
            singleSplat.Rendered = 1;
        })
        splat.applyRendering();

        touchPoints1 = [];
        touchPoints2 = [];
        frustum1 = null;
        frustum2 = null;
        frustumCreationActive = false;

        floatingButton.textContent = "Maskieren beginnen"
        floatingButton.style.bottom = '20px';

    } else if(floatingButton.textContent == "Erneut Platzieren") {

    } else {
        frustumCreationActive = true;
    }    
});



document.getElementById('select-splats-mouse').addEventListener('click', function() {
    clearSelection();

    document.getElementById('side-menu').style.left = '-300px'; // Menü schließen
    setMouseUsage(MouseUsage.SELECT);
    addMouseListener();
});

function removeMouseListener() {
    if(currentMouseUsage === MouseUsage.DIMINSIH) {
        document.removeEventListener('mouseup', handleMouseDown2, true);
    } else if(currentMouseUsage === MouseUsage.SELECT) {
        document.removeEventListener('mouseup', handleMouseDown, true);
    }     
}

function addMouseListener() {
    if(currentMouseUsage === MouseUsage.DIMINSIH) {
        document.addEventListener('mouseup', handleMouseDown2, true);
    } else if(currentMouseUsage === MouseUsage.SELECT) {
        document.addEventListener('mouseup', handleMouseDown, true);
    }       
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
            splat.applyRendering();      
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
    splat.applyRendering();    
    
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

let firstSplat = true;

document.getElementById("set-transparency").addEventListener("click", function() {    
    splat.splats.forEach(singleSplat => {    
        if(singleSplat.Rendered) {
            if(firstSplat) {
                console.log(singleSplat);
                firstSplat =false;
            }            
            // let color = new Uint8Array([singleSplat.Color[0], singleSplat.Color[1], singleSplat.Color[2], 5]);
        }         
        // singleSplat.Color = color;      
    })
    
    splat.applyRendering();  
})

document.getElementById("Reset-transparency").addEventListener("click", function() {
    
    splat.splats.forEach(async singleSplat => {                        
        singleSplat.ResetColor();  
    })    
    splat.applyRendering();  
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


function drawRectangle(tx1, ty1, tx2, ty2) {
    const x1 = ((tx1 + 1) / 2) * canvas.clientWidth;
    const y1 = ((1 - ty1) / 2) * canvas.clientHeight
    const x2 = ((tx2 + 1) / 2) * canvas.clientWidth;
    const y2 = ((1 - ty2) / 2) * canvas.clientHeight

    if (currentRectangle) {
        currentRectangle.remove();
    }

    const rect = document.createElement('div');
    rect.classList.add('rectangle');
    rect.style.left = `${Math.min(x1, x2)}px`;
    rect.style.top = `${Math.min(y1, y2)}px`;
    rect.style.width = `${Math.abs(x2 - x1)}px`;
    rect.style.height = `${Math.abs(y2 - y1)}px`;
    document.body.appendChild(rect);
    
    currentRectangle = rect;
}

function drawRing(posX, posY, ringNumber) {
    const x1 = ((posX + 1) / 2) * canvas.clientWidth;
    const y1 = ((1 - posY) / 2) * canvas.clientHeight;

    if (ringNumber === 1 && currentRing1) {
        currentRing1.remove();
    }
    if (ringNumber === 2 && currentRing2) {
        currentRing2.remove();
    }

    const ring = document.createElement('div');
    ring.classList.add('ring');
    ring.style.left = `${x1}px`;
    ring.style.top = `${y1}px`;
    document.body.appendChild(ring);

    if (ringNumber === 1) {
        currentRing1 = ring;
    } else if (ringNumber === 2) {
        currentRing2 = ring;
    }
}

function hideScreenDrawings() {
    if (currentRing1) {
        currentRing1.remove();
    }

    if (currentRing2) {
        currentRing2.remove();
    }

    if (currentRectangle) {
        currentRectangle.remove();
    }
}

let touchPoints1 = [];
let touchPoints2 = [];
let frustum1 = null;
let frustum2 = null;
let frustumCreationActive = false;

function handleMouseDown2(event) {    
    if (event.button === 0) {
        if (frustumCreationActive && touchPoints1.length < 2) {
            if(touchPoints1.length == 0) {
                addTouchPoint(touchPoints1, 1, event);
            } else {
                addTouchPoint(touchPoints1, 2, event);
            }
            
            if (touchPoints1.length === 2) {
                frustum1 = createFrustumFromTouchPoints(touchPoints1);
                console.log("First Frustum Created");

                const floatingButton = document.getElementById('floatingButton');
                floatingButton.textContent = "Erneut Maskieren";
                floatingButton.style.bottom = '20px';
                frustumCreationActive = false;

                setTimeout(function() {
                    hideScreenDrawings();
                }, 2000);
            }
        } else if (frustumCreationActive && touchPoints2.length < 2) {
            if(touchPoints2.length == 0) {
                addTouchPoint(touchPoints2, 1, event);
            } else {
                addTouchPoint(touchPoints2, 2, event);
            }
                        
            if (touchPoints2.length === 2) {
                frustum2 = createFrustumFromTouchPoints(touchPoints2);
                console.log("Second Frustum Created");

                const floatingButton = document.getElementById('floatingButton');
                floatingButton.textContent = "Diminish";
                floatingButton.style.bottom = '20px';

                if (frustum1 && frustum2) {    
                    // frustum1.drawFrustum(renderer, [false, false, false, false, false, false]);
                    // frustum2.drawFrustum(renderer, [false, false, false, false, false, false]);

                    const intersectionPoints = frustum1.intersectFrustum(frustum2);
                                                            
                    drawIntersectionVolume(intersectionPoints);                    
                }
            }
        }
    }
}

function addTouchPoint(touchPoints, number, event) {
    let x = (event.clientX / canvas.clientWidth) * 2 - 1;
    let y = -(event.clientY / canvas.clientHeight) * 2 + 1;

    touchPoints.push({ x, y });

    drawRing(x, y, number);
}

function createFrustumFromTouchPoints(touchPoints) {
    let nearTopLeft = camera.screenToWorldPoint(touchPoints[0].x, touchPoints[0].y);
    let nearBottomRight = camera.screenToWorldPoint(touchPoints[1].x, touchPoints[1].y);
    let nearTopRight = camera.screenToWorldPoint(touchPoints[1].x, touchPoints[0].y);
    let nearBottomLeft = camera.screenToWorldPoint(touchPoints[0].x, touchPoints[1].y);
                                    
    let farTopLeft = nearTopLeft.add(camera.screenPointToRay(touchPoints[0].x, touchPoints[0].y).multiply(15));                
    let farTopRight = nearTopRight.add(camera.screenPointToRay(touchPoints[1].x, touchPoints[0].y).multiply(15));
    let farBottomLeft = nearBottomLeft.add(camera.screenPointToRay(touchPoints[0].x, touchPoints[1].y).multiply(15));
    let farBottomRight = nearBottomRight.add(camera.screenPointToRay(touchPoints[1].x, touchPoints[1].y).multiply(15));

    let frustum = new SPLAT.Frustum();
    frustum.setFromPoints(nearTopLeft, nearTopRight, nearBottomLeft, nearBottomRight, farTopLeft, farTopRight,farBottomLeft, farBottomRight);                

    return frustum;
}

let screenPoints;
let cullByCube = false;
let boxObject;

function drawIntersectionVolume(box) {                 
                   
    boxObject = box;
    initialCenter = boxObject.center();
    initialSize = boxObject.size();    

    cameraPosition = camera.position.clone();
    cameraRotation = camera.rotation.clone();

    boxObject.drawBox(renderer);
    
    hideScreenDrawings();
}

document.getElementById('blendSlider').addEventListener('input', function() {
    const slider = document.getElementById('blendSlider');
    
    blend_value = slider.value;
});


let nearTopLeft, nearBottomRight, nearTopRight, nearBottomLeft;
let farTopLeft, farTopRight, farBottomLeft, farBottomRight;

let firstTime = true;

function updateBoxFrustum() {      
    
    screenPoints = boxObject.getCorners().map(corner => camera.worldToScreenPoint(corner));
    // cullByCube = false;     
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const point of screenPoints) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
    }    
    
    nearTopLeft = camera.screenToWorldPoint(minX, maxY);
    nearBottomRight = camera.screenToWorldPoint(maxX, minY);
    nearTopRight = camera.screenToWorldPoint(maxX, maxY);
    nearBottomLeft = camera.screenToWorldPoint(minX, minY);

    farTopLeft = nearTopLeft.add(camera.screenPointToRay(minX, maxY).multiply(camera.data.far));
    farTopRight = nearTopRight.add(camera.screenPointToRay(maxX, maxY).multiply(camera.data.far));
    farBottomLeft = nearBottomLeft.add(camera.screenPointToRay(minX, minY).multiply(camera.data.far));
    farBottomRight = nearBottomRight.add(camera.screenPointToRay(maxX, minY).multiply(camera.data.far));

    // boxFrustum.ereaseFrustum(renderer);
    boxFrustum.setFromPoints(nearTopLeft, nearTopRight, nearBottomLeft, nearBottomRight, farTopLeft, farTopRight,farBottomLeft, farBottomRight);
    

    drawRectangle(minX, minY, maxX, maxY);  

    const iterator = new SPLAT.OctreeIterator(splat._octree.root, boxFrustum);    
    
    splat.data.resetRendering();
    
    // Funktion zur Verarbeitung einzelner Splats
    function processSingleSplat(singleSplat) {
        const distance = boxFrustum.distanceToPoint(singleSplat.PositionVec3);
        if (distance > 0) { //boxFrustum.containsBox(singleSplat.bounds)) {            
            singleSplat.Rendered = 1;            
            const transparency = Math.min(distance / transparency_threshold, 1.0);
            singleSplat.setTransparency(transparency);
            singleSplat.setBlending(1);            
        } else {
            // console.log("outside!")
            // console.log(distance)
        }
    }

    // Promises zur Parallelisierung
    const promises = [];
    const nodes = [];
    for (let result = iterator.next(); !result.done; result = iterator.next()) {
        nodes.push(result.value);
    }

    nodes.forEach(node => {
        const nodeDataArray = node.data?.data;

        if (nodeDataArray) {
            
            promises.push(
                new Promise((resolve) => {
                    nodeDataArray.forEach(singleSplat => {
                        processSingleSplat(singleSplat);
                    });
                    resolve();
                })
            );
        }
    });

    Promise.all(promises).then(() => {
        splat.applyRendering();        
    });   
               
}