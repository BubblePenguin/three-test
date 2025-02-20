import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

scene.rotateX(-Math.PI / 2);
camera.position.set(1, 1, 4);
camera.lookAt(0, 0, 0);

const gui = new GUI();

scene.add(new THREE.AxesHelper(1));

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

new OrbitControls(camera, renderer.domElement);

// Datasets

const planeData = {
  width: 4,
  depth: 4,
};
const cubeData = {
  width: 0.15,
  height: 2.2,
  depth: 0.15,

  thickness: 0.15,
  length: 2.2,
  gap: 0.001,
};

const houseData = {
  maxWidthBetweenPanels: 3,
};

const lodgeData = {
  thickness: 0.02,
  height: 0.2,
  innerDistance: 0.18,
  lowerLipDistance: 0.1,
};

const defaultMesh = new THREE.MeshNormalMaterial();
// const defaultMesh = new THREE.MeshBasicMaterial({ color: 0xffffff });

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(planeData.width, planeData.depth),
  // new THREE.MeshBasicMaterial({ color: 0xffffff })
  // new THREE.MeshNormalMaterial()
  defaultMesh
);

// Arrays

const balks: THREE.Mesh<THREE.BoxGeometry>[] = [];
const horizontalBalks: THREE.Mesh<THREE.BoxGeometry>[] = [];
const additionalXBalks: THREE.Mesh<THREE.BoxGeometry>[] = [];
const additionalYBalks: THREE.Mesh<THREE.BoxGeometry>[] = [];
const lodgeFirstLip: THREE.Mesh<THREE.BoxGeometry>[] = [];
const lodgeSecondLip: THREE.Mesh<THREE.BoxGeometry>[] = [];

// Initializations

const createVerticalBalks = () => {
  // const balks: THREE.Mesh<THREE.BoxGeometry>[] = [];

  for (let i = 0; i < 4; i++) {
    balks.push(
      new THREE.Mesh(
        new THREE.BoxGeometry(
          cubeData.thickness,
          cubeData.thickness,
          cubeData.height
        ),
        // new THREE.MeshBasicMaterial({ color: 0xffffff })
        // new THREE.MeshNormalMaterial()
        defaultMesh
      )
    );
    plane.add(balks[i]);
  }
  // return balks;
};

const createHorizontalBalks = () => {
  // const horizontalBalks: THREE.Mesh<THREE.BoxGeometry>[] = [];

  for (let i = 0; i < 2; i++) {
    horizontalBalks.push(
      new THREE.Mesh(
        new THREE.BoxGeometry(
          planeData.width,
          cubeData.thickness,
          cubeData.thickness
        ),
        // new THREE.MeshBasicMaterial({ color: 0xffffff })
        // new THREE.MeshNormalMaterial()
        defaultMesh
      )
    );
    plane.add(horizontalBalks[i]);
  }
  for (let i = 2; i < 4; i++) {
    horizontalBalks.push(
      new THREE.Mesh(
        new THREE.BoxGeometry(
          cubeData.thickness,
          planeData.depth - cubeData.thickness * 2 - cubeData.gap * 2,
          cubeData.thickness
        ),
        // new THREE.MeshBasicMaterial({ color: 0xffffff })
        // new THREE.MeshNormalMaterial()
        defaultMesh
      )
    );
    plane.add(horizontalBalks[i]);
  }

  // return horizontalBalks;
};

const createAdditionalXBalks = () => {
  // const additionalXBalks: THREE.Mesh<THREE.BoxGeometry>[] = [];

  const xBalks = planeData.width / houseData.maxWidthBetweenPanels;

  for (let i = 0; i < xBalks; i++) {
    additionalXBalks.push(
      new THREE.Mesh(
        new THREE.BoxGeometry(
          cubeData.thickness,
          cubeData.thickness,
          cubeData.height
        ),
        defaultMesh
      )
    );
    additionalXBalks[i + i].position.set(
      -planeData.width / 2 -
        cubeData.thickness / 2 +
        (planeData.width / Math.trunc(xBalks)) * (i + 1),
      planeData.depth / 2 - cubeData.thickness / 2,
      cubeData.height / 2
    );
    plane.add(additionalXBalks[i + i]);

    additionalXBalks.push(
      new THREE.Mesh(
        new THREE.BoxGeometry(
          cubeData.thickness,
          cubeData.thickness,
          cubeData.height
        ),
        defaultMesh
      )
    );
    additionalXBalks[i + i + 1].position.set(
      -planeData.width / 2 -
        cubeData.thickness / 2 +
        (planeData.width / Math.trunc(xBalks)) * (i + 1),
      -planeData.depth / 2 + cubeData.thickness / 2,
      cubeData.height / 2
    );
    plane.add(additionalXBalks[i + i + 1]);
  }
};
const createAdditionalYBalks = () => {
  // const additionalXBalks: THREE.Mesh<THREE.BoxGeometry>[] = [];

  const yBalks = planeData.depth / houseData.maxWidthBetweenPanels;

  for (let i = 0; i < yBalks; i++) {
    additionalYBalks.push(
      new THREE.Mesh(
        new THREE.BoxGeometry(
          cubeData.thickness,
          cubeData.thickness,
          cubeData.height
        ),
        defaultMesh
      )
    );
    additionalYBalks[i * 2].position.set(
      planeData.width / 2 - cubeData.thickness / 2,
      -planeData.depth / 2 -
        cubeData.thickness / 2 +
        (planeData.depth / Math.trunc(yBalks)) * (i + 1),
      cubeData.height / 2
    );
    plane.add(additionalYBalks[i * 2]);

    additionalYBalks.push(
      new THREE.Mesh(
        new THREE.BoxGeometry(
          cubeData.thickness,
          cubeData.thickness,
          cubeData.height
        ),
        defaultMesh
      )
    );
    additionalYBalks[i * 2 + 1].position.set(
      -planeData.width / 2 + cubeData.thickness / 2,
      -planeData.depth / 2 -
        cubeData.thickness / 2 +
        (planeData.depth / Math.trunc(yBalks)) * (i + 1),
      cubeData.height / 2
    );
    plane.add(additionalYBalks[i * 2 + 1]);
  }
};
const createLodgeLip = () => {
  for (let i = 0; i < 2; i++) {
    lodgeFirstLip.push(
      new THREE.Mesh(
        new THREE.BoxGeometry(
          planeData.width +
            lodgeData.thickness * 2 +
            lodgeData.innerDistance * 2,
          lodgeData.thickness,
          lodgeData.height
        ),
        defaultMesh
      )
    );
    lodgeSecondLip.push(
      new THREE.Mesh(
        new THREE.BoxGeometry(
          planeData.width +
            lodgeData.thickness * 4 +
            lodgeData.innerDistance * 2,
          lodgeData.thickness,
          lodgeData.height
        ),
        defaultMesh
      )
    );
    plane.add(lodgeFirstLip[i]);
    plane.add(lodgeSecondLip[i]);
  }
  for (let i = 2; i < 4; i++) {
    lodgeFirstLip.push(
      new THREE.Mesh(
        new THREE.BoxGeometry(
          lodgeData.thickness,
          planeData.depth + lodgeData.innerDistance * 2 - cubeData.gap * 2,
          lodgeData.height
        ),
        defaultMesh
      )
    );
    lodgeSecondLip.push(
      new THREE.Mesh(
        new THREE.BoxGeometry(
          lodgeData.thickness,
          planeData.depth +
            lodgeData.innerDistance * 2 -
            cubeData.gap * 2 +
            lodgeData.thickness * 2,
          lodgeData.height
        ),
        defaultMesh
      )
    );
    plane.add(lodgeFirstLip[i]);
    plane.add(lodgeSecondLip[i]);
  }
};

createHorizontalBalks();
createVerticalBalks();
createAdditionalXBalks();
createAdditionalYBalks();
createLodgeLip();

scene.add(plane);

//Positions

const balksPosition = () => {
  balks[0].position.set(
    planeData.width / 2 - cubeData.thickness / 2,
    planeData.depth / 2 - cubeData.thickness / 2,
    cubeData.height / 2
  );
  balks[1].position.set(
    planeData.width / 2 - cubeData.thickness / 2,
    -planeData.depth / 2 + cubeData.thickness / 2,
    cubeData.height / 2
  );
  balks[2].position.set(
    -planeData.width / 2 + cubeData.thickness / 2,
    planeData.depth / 2 - cubeData.thickness / 2,
    cubeData.height / 2
  );
  balks[3].position.set(
    -planeData.width / 2 + cubeData.thickness / 2,
    -planeData.depth / 2 + cubeData.thickness / 2,
    cubeData.height / 2
  );
};

const horizontalBalksPosition = () => {
  //y balks
  horizontalBalks[0].position.set(
    0,
    planeData.depth / 2 - cubeData.thickness / 2,
    cubeData.height + cubeData.thickness / 2 + cubeData.gap
  );
  horizontalBalks[1].position.set(
    0,
    -planeData.depth / 2 + cubeData.width / 2,
    cubeData.height + cubeData.thickness / 2 + cubeData.gap
  );

  //x balks
  horizontalBalks[2].position.set(
    planeData.width / 2 - cubeData.thickness / 2,
    0,
    cubeData.height + cubeData.thickness / 2 + cubeData.gap
  );

  horizontalBalks[3].position.set(
    -planeData.width / 2 + cubeData.thickness / 2,
    0,
    cubeData.height + cubeData.thickness / 2 + cubeData.gap
  );
};

const additionalXBalksPosition = () => {
  const xBalks = planeData.width / houseData.maxWidthBetweenPanels;

  additionalXBalks.map((balk) => {
    balk.removeFromParent();
  });

  for (let i = 0; i < xBalks - 1; i++) {
    additionalXBalks[i + i].position.set(
      -planeData.width / 2 -
        cubeData.thickness / 2 +
        (planeData.width / Math.trunc(xBalks)) * (i + 1),
      planeData.depth / 2 - cubeData.thickness / 2,
      cubeData.height / 2
    );
    plane.add(additionalXBalks[i + i]);

    additionalXBalks[i + i + 1].position.set(
      -planeData.width / 2 -
        cubeData.thickness / 2 +
        (planeData.width / Math.trunc(xBalks)) * (i + 1),
      -planeData.depth / 2 + cubeData.thickness / 2,
      cubeData.height / 2
    );
    plane.add(additionalXBalks[i + i + 1]);
  }
};

const additionalYBalksPosition = () => {
  const yBalks = planeData.depth / houseData.maxWidthBetweenPanels;

  additionalYBalks.map((balk) => {
    balk.removeFromParent();
  });

  for (let i = 0; i < yBalks - 1; i++) {
    additionalYBalks[i * 2].position.set(
      planeData.width / 2 - cubeData.thickness / 2,
      -planeData.depth / 2 -
        cubeData.thickness / 2 +
        (planeData.depth / Math.trunc(yBalks)) * (i + 1),
      cubeData.height / 2
    );
    plane.add(additionalYBalks[i * 2]);

    additionalYBalks[i * 2 + 1].position.set(
      -planeData.width / 2 + cubeData.thickness / 2,
      -planeData.depth / 2 -
        cubeData.thickness / 2 +
        (planeData.depth / Math.trunc(yBalks)) * (i + 1),
      cubeData.height / 2
    );
    plane.add(additionalYBalks[i * 2 + 1]);
  }
};

const lodgeFirstLipPosition = () => {
  const height =
    cubeData.height +
    lodgeData.height / 2 +
    cubeData.gap +
    lodgeData.lowerLipDistance;

  lodgeFirstLip[0].position.set(
    0,
    planeData.depth / 2 + lodgeData.thickness / 2 + lodgeData.innerDistance,
    height
  );
  lodgeFirstLip[1].position.set(
    0,
    -planeData.depth / 2 - lodgeData.thickness / 2 - lodgeData.innerDistance,
    height
  );

  lodgeFirstLip[2].position.set(
    planeData.width / 2 + lodgeData.thickness / 2 + lodgeData.innerDistance,
    0,
    height
  );

  lodgeFirstLip[3].position.set(
    -planeData.width / 2 - lodgeData.thickness / 2 - lodgeData.innerDistance,
    0,
    height
  );
};

const lodgeSecondLipPosition = () => {
  const height =
    cubeData.height +
    lodgeData.height / 2 +
    cubeData.gap +
    lodgeData.lowerLipDistance * 2;

  lodgeSecondLip[0].position.set(
    0,
    planeData.depth / 2 +
      lodgeData.thickness / 2 +
      lodgeData.innerDistance +
      lodgeData.thickness,
    height
  );
  lodgeSecondLip[1].position.set(
    0,
    -planeData.depth / 2 -
      lodgeData.thickness / 2 -
      lodgeData.innerDistance -
      lodgeData.thickness,
    height
  );

  lodgeSecondLip[2].position.set(
    planeData.width / 2 +
      lodgeData.thickness / 2 +
      lodgeData.innerDistance +
      lodgeData.thickness,
    0,
    height
  );

  lodgeSecondLip[3].position.set(
    -planeData.width / 2 -
      lodgeData.thickness / 2 -
      lodgeData.innerDistance -
      lodgeData.thickness,
    0,
    height
  );
};

// Regenerations

function regeneratePlaneGeometry() {
  const newGeometry = new THREE.PlaneGeometry(planeData.width, planeData.depth);

  if (horizontalBalks.length > 0) {
    horizontalBalks.map((c, i) => {
      c.geometry.dispose();
      c.geometry =
        i < 2
          ? new THREE.BoxGeometry(
              planeData.width,
              cubeData.thickness,
              cubeData.thickness
            )
          : new THREE.BoxGeometry(
              cubeData.thickness,
              planeData.depth - cubeData.thickness * 2 - cubeData.gap * 2,
              cubeData.thickness
            );
    });
  }

  if (lodgeFirstLip.length > 0) {
    lodgeFirstLip.map((c, i) => {
      c.geometry.dispose();
      c.geometry =
        i < 2
          ? new THREE.BoxGeometry(
              planeData.width +
                lodgeData.thickness * 2 +
                lodgeData.innerDistance * 2,
              lodgeData.thickness,
              lodgeData.height
            )
          : new THREE.BoxGeometry(
              lodgeData.thickness,
              planeData.depth + lodgeData.innerDistance * 2 - cubeData.gap * 2,
              lodgeData.height
            );
    });
  }

  if (lodgeSecondLip.length > 0) {
    lodgeSecondLip.map((c, i) => {
      c.geometry.dispose();
      c.geometry =
        i < 2
          ? new THREE.BoxGeometry(
              planeData.width +
                lodgeData.thickness * 4 +
                lodgeData.innerDistance * 2,
              lodgeData.thickness,
              lodgeData.height
            )
          : new THREE.BoxGeometry(
              lodgeData.thickness,
              planeData.depth +
                lodgeData.innerDistance * 2 +
                lodgeData.thickness * 2 -
                cubeData.gap * 2,
              lodgeData.height
            );
    });
  }

  plane.geometry.dispose();
  plane.geometry = newGeometry;
}

function regenerateCubeGeometry() {
  if (balks.length > 0) {
    balks.map((cube) => {
      cube.geometry.dispose();
      cube.geometry = new THREE.BoxGeometry(
        cubeData.thickness,
        cubeData.thickness,
        cubeData.height
      );
    });
  }

  if (additionalXBalks.length > 0) {
    additionalXBalks.map((cube) => {
      cube.geometry.dispose();
      cube.geometry = new THREE.BoxGeometry(
        cubeData.thickness,
        cubeData.thickness,
        cubeData.height
      );
    });
  }

  if (additionalYBalks.length > 0) {
    additionalYBalks.map((cube) => {
      cube.geometry.dispose();
      cube.geometry = new THREE.BoxGeometry(
        cubeData.thickness,
        cubeData.thickness,
        cubeData.height
      );
    });
  }
}

// GUI

const House = gui.addFolder("House");

House.add(planeData, "width", 2, 9).onChange(regeneratePlaneGeometry);
House.add(planeData, "depth", 2, 9).onChange(regeneratePlaneGeometry);
House.add(cubeData, "height", 2, 4).onChange(regenerateCubeGeometry);

function animate() {
  requestAnimationFrame(animate);
  camera.lookAt(0, cubeData.height / 2, 0);

  balksPosition();
  horizontalBalksPosition();
  additionalXBalksPosition();
  additionalYBalksPosition();
  lodgeFirstLipPosition();
  lodgeSecondLipPosition();

  renderer.render(scene, camera);
}

animate();
