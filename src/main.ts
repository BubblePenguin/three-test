import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//Please dont judje me too hard, I'm just learning
//It's almost first time doing 3D stuff
//I know there is planty options for optimization and refactoring
//But i had little to no time to learn as well as impliment test task
//I'm pretty sure if i had at least week or smthn, id first learn more about 3D and then do this task
//Two days ago i was pretty sure thats i'm not gonna be able to do this task
//But i did it, and i'm proud of myself
//I'm pretty sure i can do better, and i'm gonna do better

// Most of later code is better than first part, at least i think so

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

// scene.add(new THREE.AxesHelper(1));

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
  width: 6.1,
  depth: 3,
  maxWidth: 9,
  maxDepth: 9,
};

const cubeData = {
  width: 0.15,
  height: 2.2,
  depth: 0.15,

  thickness: 0.15,
  length: 2.2,
  gap: 0.001,

  maxHeight: 4,
};

const houseData = {
  maxWidthBetweenPanels: 3,
  maxIneerLodgeFrameDistance: 0.5,
  lipHeight: 0.1,
  lipInnerDistance: 0.18,
};

const lodgeData = {
  thickness: 0.02,
  height: 0.2,
};

const innerLodgeFrameData = {
  thickness: 0.05,
  height: lodgeData.height + houseData.lipHeight - cubeData.thickness,
};

const flooringData = {
  thickness: 0.002,
  width: 0.2,
  minGap: 0.1,
};

const defaultMesh = new THREE.MeshNormalMaterial();
// const defaultMesh = new THREE.MeshBasicMaterial({ color: 0xffffff });

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(planeData.width, planeData.depth),
  defaultMesh
);

//Very importaint arr
const regenerationsArr: Array<() => void> = [];

// Initializations

interface CoordData {
  x: number;
  y: number;
  z: number;
}
interface Paramaters {
  Sizes: () => CoordData;
  Position: () => CoordData;
  axis: "x" | "y" | "z";
}

const createBlock = (parent: THREE.Object3D, paramaters: Paramaters) => {
  const { Sizes, axis, Position } = paramaters;

  const position = Position();
  const sizes = Sizes();

  const geometry = new THREE.BoxGeometry(sizes.x, sizes.y, sizes.z);

  const boxes = [
    new THREE.Mesh(geometry, defaultMesh),
    new THREE.Mesh(geometry, defaultMesh),
  ];

  boxes.map((box, i) => {
    box.position.set(
      axis === "y" && i < 1 ? -position.x : position.x,
      axis === "x" && i < 1 ? -position.y : position.y,
      position.z
    );
    parent.add(box);
  });

  const regenerate = () => {
    const sizes = Sizes();
    const position = Position();

    boxes.map((box, i) => {
      box.geometry.dispose();
      box.geometry = new THREE.BoxGeometry(sizes.x, sizes.y, sizes.z);
      box.position.set(
        axis === "y" && i < 1 ? -position.x : position.x,
        axis === "x" && i < 1 ? -position.y : position.y,
        position.z
      );
    });
  };
  regenerationsArr.push(regenerate);
};

const createAdditionalXBalks = () => {
  const additionalXBalks: THREE.Mesh<THREE.BoxGeometry>[] = [];

  const xBalks = planeData.maxWidth / houseData.maxWidthBetweenPanels;

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
    // plane.add(additionalXBalks[i + i]);

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
    // plane.add(additionalXBalks[i + i + 1]);
  }

  const regenerate = () => {
    const xBalks = planeData.width / houseData.maxWidthBetweenPanels;

    additionalXBalks.map((balk) => {
      balk.removeFromParent();
      balk.geometry.dispose();
      balk.geometry = new THREE.BoxGeometry(
        cubeData.thickness,
        cubeData.thickness,
        cubeData.height
      );
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
  regenerate();
  regenerationsArr.push(regenerate);
};

const createAdditionalYBalks = () => {
  const additionalYBalks: THREE.Mesh<THREE.BoxGeometry>[] = [];

  const yBalks = planeData.maxDepth / houseData.maxWidthBetweenPanels;

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
    // plane.add(additionalYBalks[i * 2]);

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
    // plane.add(additionalYBalks[i * 2 + 1]);
  }

  const regenerate = () => {
    const yBalks = planeData.depth / houseData.maxWidthBetweenPanels;

    additionalYBalks.map((balk) => {
      balk.removeFromParent();
      balk.geometry.dispose();
      balk.geometry = new THREE.BoxGeometry(
        cubeData.thickness,
        cubeData.thickness,
        cubeData.height
      );
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
  regenerate();
  regenerationsArr.push(regenerate);
};

const createAdditionalLodgeFrame = () => {
  const additionalInnerLodgeFrame: THREE.Mesh<THREE.BoxGeometry>[] = [];

  const amount = Math.trunc(
    (planeData.maxDepth - innerLodgeFrameData.thickness) /
      houseData.maxIneerLodgeFrameDistance
  );

  for (let i = 0; i < amount - 1; i++) {
    additionalInnerLodgeFrame.push(
      new THREE.Mesh(
        new THREE.BoxGeometry(
          planeData.width - cubeData.gap * 2 - innerLodgeFrameData.thickness,
          innerLodgeFrameData.thickness,
          innerLodgeFrameData.height
        ),

        defaultMesh
      )
    );
  }

  const regenerate = () => {
    additionalInnerLodgeFrame.map((c) => {
      c.removeFromParent();
      c.geometry.dispose();
      c.geometry = new THREE.BoxGeometry(
        planeData.width - cubeData.gap * 2 - innerLodgeFrameData.thickness,
        innerLodgeFrameData.thickness,
        innerLodgeFrameData.height
      );
    });

    const renderAmount =
      Math.trunc(
        (planeData.depth - innerLodgeFrameData.thickness) /
          houseData.maxIneerLodgeFrameDistance
      ) - 1;

    const height =
      cubeData.height + cubeData.thickness + innerLodgeFrameData.height / 2;

    for (let i = 0; i < renderAmount; i++) {
      additionalInnerLodgeFrame[i].position.set(
        0,
        planeData.depth / 2 -
          cubeData.thickness / 2 -
          ((planeData.depth - innerLodgeFrameData.thickness) / renderAmount) *
            (i + 1),
        height
      );
      plane.add(additionalInnerLodgeFrame[i]);
    }
  };
  regenerate();
  regenerationsArr.push(regenerate);
};

const createFlooring = () => {
  const flooring: THREE.Mesh<THREE.BoxGeometry>[] = [];

  const maxAmount = Math.trunc(
    (planeData.maxWidth +
      houseData.lipInnerDistance * 2 +
      lodgeData.thickness * 2 +
      cubeData.gap * 2) /
      flooringData.width
  );

  for (let i = 0; i < maxAmount; i++) {
    flooring.push(
      new THREE.Mesh(
        new THREE.BoxGeometry(
          flooringData.width,
          planeData.depth +
            houseData.lipInnerDistance * 2 -
            cubeData.gap * 2 +
            lodgeData.thickness * 2,
          flooringData.thickness
        ),
        defaultMesh
      )
    );
  }

  const regenerate = () => {
    flooring.map((c) => {
      c.parent && c.removeFromParent();
      c.geometry.dispose();
      c.geometry = new THREE.BoxGeometry(
        flooringData.width,
        planeData.depth +
          houseData.lipInnerDistance * 2 -
          cubeData.gap * 2 +
          lodgeData.thickness * 2,
        flooringData.thickness
      );
    });

    const amount = Math.trunc(
      (planeData.width +
        houseData.lipInnerDistance * 2 +
        lodgeData.thickness * 2 +
        cubeData.gap * 2) /
        flooringData.width
    );

    const height =
      cubeData.height +
      cubeData.thickness +
      innerLodgeFrameData.height +
      flooringData.thickness / 2;

    for (let i = 0; i < amount; i++) {
      flooring[i].position.set(
        ((planeData.width +
          houseData.lipInnerDistance * 2 +
          lodgeData.thickness * 2 +
          cubeData.gap * 2) /
          amount) *
          (i + 1) -
          planeData.width / 2 -
          houseData.lipInnerDistance -
          lodgeData.thickness -
          cubeData.gap * 2 -
          flooringData.width / 2,
        0,
        height
      );
      plane.add(flooring[i]);
    }
  };

  regenerate();

  regenerationsArr.push(regenerate);
};

//Initializations
{
  createAdditionalXBalks();
  createAdditionalYBalks();
  createAdditionalLodgeFrame();
  createFlooring();

  {
    createBlock(plane, {
      Sizes: () => ({
        x: cubeData.thickness,
        y: cubeData.thickness,
        z: cubeData.height,
      }),
      Position: () => ({
        x: planeData.width / 2 - cubeData.thickness / 2,
        y: planeData.depth / 2 - cubeData.thickness / 2,
        z: cubeData.height / 2,
      }),
      axis: "x",
    });

    createBlock(plane, {
      Sizes: () => ({
        x: cubeData.thickness,
        y: cubeData.thickness,
        z: cubeData.height,
      }),
      Position: () => ({
        x: -planeData.width / 2 + cubeData.thickness / 2,
        y: planeData.depth / 2 - cubeData.thickness / 2,
        z: cubeData.height / 2,
      }),
      axis: "x",
    });
  }
  {
    createBlock(plane, {
      Sizes: () => ({
        x: planeData.width,
        y: cubeData.thickness,
        z: cubeData.thickness,
      }),
      Position: () => ({
        x: 0,
        y: planeData.depth / 2 - cubeData.thickness / 2,
        z: cubeData.height + cubeData.thickness / 2 + cubeData.gap,
      }),
      axis: "x",
    });

    createBlock(plane, {
      Sizes: () => ({
        x: cubeData.thickness,
        y: planeData.depth - cubeData.thickness * 2 - cubeData.gap * 2,
        z: cubeData.thickness,
      }),
      Position: () => ({
        x: planeData.width / 2 - cubeData.thickness / 2,
        y: 0,
        z: cubeData.height + cubeData.thickness / 2 + cubeData.gap,
      }),
      axis: "y",
    });
  }

  {
    createBlock(plane, {
      Sizes: () => ({
        x:
          planeData.width +
          lodgeData.thickness * 2 +
          houseData.lipInnerDistance * 2,
        y: lodgeData.thickness,
        z: lodgeData.height,
      }),
      Position: () => ({
        x: 0,
        y:
          planeData.depth / 2 +
          lodgeData.thickness / 2 +
          houseData.lipInnerDistance,
        z:
          cubeData.height +
          lodgeData.height / 2 +
          cubeData.gap +
          houseData.lipHeight,
      }),
      axis: "x",
    });

    createBlock(plane, {
      Sizes: () => ({
        x: lodgeData.thickness,
        y: planeData.depth + houseData.lipInnerDistance * 2 - cubeData.gap * 2,
        z: lodgeData.height,
      }),
      Position: () => ({
        x:
          planeData.width / 2 +
          lodgeData.thickness / 2 +
          houseData.lipInnerDistance,

        y: 0,
        z:
          cubeData.height +
          lodgeData.height / 2 +
          cubeData.gap +
          houseData.lipHeight,
      }),
      axis: "y",
    });
  }

  {
    createBlock(plane, {
      Sizes: () => ({
        x:
          planeData.width +
          lodgeData.thickness * 4 +
          houseData.lipInnerDistance * 2,
        y: lodgeData.thickness,
        z: lodgeData.height,
      }),
      Position: () => ({
        x: 0,
        y:
          planeData.depth / 2 +
          lodgeData.thickness / 2 +
          houseData.lipInnerDistance +
          lodgeData.thickness,
        z:
          cubeData.height +
          lodgeData.height / 2 +
          cubeData.gap +
          houseData.lipHeight * 2,
      }),
      axis: "x",
    });

    createBlock(plane, {
      Sizes: () => ({
        x: lodgeData.thickness,
        y:
          planeData.depth +
          houseData.lipInnerDistance * 2 -
          cubeData.gap * 2 +
          lodgeData.thickness * 2,
        z: lodgeData.height,
      }),
      Position: () => ({
        x:
          planeData.width / 2 +
          lodgeData.thickness / 2 +
          houseData.lipInnerDistance +
          lodgeData.thickness,
        y: 0,
        z:
          cubeData.height +
          lodgeData.height / 2 +
          cubeData.gap +
          houseData.lipHeight * 2,
      }),
      axis: "y",
    });
  }

  {
    createBlock(plane, {
      Sizes: () => ({
        x: innerLodgeFrameData.thickness,
        y: planeData.depth + houseData.lipInnerDistance * 2,
        z: innerLodgeFrameData.height,
      }),
      Position: () => ({
        x: planeData.width / 2,
        y: 0,
        z:
          cubeData.height + cubeData.thickness + innerLodgeFrameData.height / 2,
      }),
      axis: "y",
    });

    createBlock(plane, {
      Sizes: () => ({
        x: planeData.width - cubeData.gap * 2 - innerLodgeFrameData.thickness,
        y: innerLodgeFrameData.thickness,
        z: innerLodgeFrameData.height,
      }),
      Position: () => ({
        x: 0,
        y: planeData.depth / 2,
        z:
          cubeData.height + cubeData.thickness + innerLodgeFrameData.height / 2,
      }),
      axis: "x",
    });
  }

  scene.add(plane);
}

// Regenerations on Change

function regeneratePlaneGeometry() {
  const newGeometry = new THREE.PlaneGeometry(planeData.width, planeData.depth);
  plane.geometry.dispose();
  plane.geometry = newGeometry;

  regenerationsArr.map((fnc) => {
    fnc();
  });
}

// GUI

const House = gui.addFolder("House");

House.add(planeData, "width", 2, planeData.maxWidth).onChange(() => {
  regeneratePlaneGeometry();
});
House.add(planeData, "depth", 2, planeData.maxDepth).onChange(() => {
  regeneratePlaneGeometry();
});
House.add(cubeData, "height", 2, cubeData.maxHeight).onChange(() => {
  regenerationsArr.map((fnc) => {
    fnc();
  });
});

function animate() {
  requestAnimationFrame(animate);
  camera.lookAt(0, cubeData.height / 2, 0);

  renderer.render(scene, camera);
}

animate();
