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

// Most of later code is better

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
  axis: "x" | "y";
}
interface ArrParamaters {
  Sizes: () => CoordData;
  Offset: () => CoordData;
  Length: () => number;
  maxLength: number;
  trim?: boolean;
  gap: number;
  axis: "x" | "y";
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

const createArr = (parent: THREE.Object3D, paramaters: ArrParamaters) => {
  const { Sizes, axis, Offset, maxLength, trim, gap, Length } = paramaters;
  const sizes = Sizes();

  const arr: THREE.Mesh<THREE.BoxGeometry>[] = [];

  const maxAmount = maxLength / gap + 1;

  for (let i = 0; i < maxAmount; i++) {
    arr.push(
      new THREE.Mesh(
        new THREE.BoxGeometry(sizes.x, sizes.y, sizes.z),
        defaultMesh
      )
    );
  }

  const regenerate = () => {
    const sizes = Sizes();
    const offset = Offset();
    const length = Length();
    const amount = length / gap;
    // console.log(length, amount);

    arr.map((balk) => {
      balk.removeFromParent();
      balk.geometry.dispose();
      balk.geometry = new THREE.BoxGeometry(sizes.x, sizes.y, sizes.z);
    });

    for (
      let i = 0;
      trim ? i < Math.trunc(amount) - 1 : i <= Math.trunc(amount);
      i++
    ) {
      arr[i].position.set(
        axis === "x"
          ? offset.x + (length / Math.trunc(amount)) * (i + (trim ? 1 : 0))
          : offset.x,
        axis === "y"
          ? offset.y + (length / Math.trunc(amount)) * (i + (trim ? 1 : 0))
          : offset.y,
        offset.z
      );
      parent.add(arr[i]);
    }
  };
  regenerate();
  regenerationsArr.push(regenerate);
};

//Initializations
{
  {
    //Vertical corners
    {
      const params: Paramaters = {
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
      };

      createBlock(plane, {
        ...params,
      });

      createBlock(plane, {
        ...params,
        Position: () => ({
          x: -planeData.width / 2 + cubeData.thickness / 2,
          y: planeData.depth / 2 - cubeData.thickness / 2,
          z: cubeData.height / 2,
        }),
      });
    }

    //Vertical Supports
    {
      {
        const params: ArrParamaters = {
          Sizes: () => ({
            x: cubeData.thickness,
            y: cubeData.thickness,
            z: cubeData.height,
          }),
          Offset: () => ({
            x: -planeData.width / 2 - cubeData.thickness / 2,
            y: planeData.depth / 2 - cubeData.thickness / 2,
            z: cubeData.height / 2,
          }),
          Length: () => planeData.width,
          trim: true,
          maxLength: planeData.maxWidth,
          gap: houseData.maxWidthBetweenPanels,
          axis: "x",
        };

        createArr(plane, {
          ...params,
        });
        createArr(plane, {
          ...params,
          Offset: () => ({
            x: -planeData.width / 2 - cubeData.thickness / 2,
            y: -planeData.depth / 2 + cubeData.thickness / 2,
            z: cubeData.height / 2,
          }),
        });
      }

      {
        const params: ArrParamaters = {
          Sizes: () => ({
            x: cubeData.thickness,
            y: cubeData.thickness,
            z: cubeData.height,
          }),
          Offset: () => ({
            x: planeData.width / 2 - cubeData.thickness / 2,
            y: -planeData.depth / 2 - cubeData.thickness / 2,
            z: cubeData.height / 2,
          }),
          Length: () => planeData.depth,
          trim: true,
          maxLength:
            (planeData.maxDepth - innerLodgeFrameData.thickness) /
            houseData.maxIneerLodgeFrameDistance,
          gap: houseData.maxWidthBetweenPanels,
          axis: "y",
        };

        createArr(plane, {
          ...params,
        });
        createArr(plane, {
          ...params,
          Offset: () => ({
            x: -planeData.width / 2 + cubeData.thickness / 2,
            y: -planeData.depth / 2 - cubeData.thickness / 2,
            z: cubeData.height / 2,
          }),
        });
      }
    }
  }

  {
    //Main frame
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

    //Outer Lip Cover
    {
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
            y:
              planeData.depth +
              houseData.lipInnerDistance * 2 -
              cubeData.gap * 2,
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
    }

    //Flooring support frame
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
            cubeData.height +
            cubeData.thickness +
            innerLodgeFrameData.height / 2,
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
            cubeData.height +
            cubeData.thickness +
            innerLodgeFrameData.height / 2,
        }),
        axis: "x",
      });
    }

    //Florring support balks
    {
      createArr(plane, {
        Sizes: () => ({
          x: planeData.width - cubeData.gap * 2 - innerLodgeFrameData.thickness,
          y: innerLodgeFrameData.thickness,
          z: innerLodgeFrameData.height,
        }),
        Offset: () => ({
          x: 0,
          y: -planeData.depth / 2 - cubeData.thickness / 2,
          z:
            cubeData.height +
            cubeData.thickness +
            innerLodgeFrameData.height / 2,
        }),
        Length: () => planeData.depth,
        trim: true,
        maxLength: planeData.maxDepth,
        gap: houseData.maxIneerLodgeFrameDistance,
        axis: "y",
      });
    }

    //Flooring
    {
      createArr(plane, {
        Sizes: () => ({
          x: flooringData.width,
          y:
            planeData.depth +
            houseData.lipInnerDistance * 2 -
            cubeData.gap * 2 +
            lodgeData.thickness * 2,
          z: flooringData.thickness,
        }),
        Offset: () => ({
          x:
            -planeData.width / 2 -
            houseData.lipInnerDistance -
            lodgeData.thickness -
            cubeData.gap * 2 +
            flooringData.width / 2,
          y: 0,
          z:
            cubeData.height +
            cubeData.thickness +
            innerLodgeFrameData.height +
            flooringData.thickness / 2,
        }),
        Length: () =>
          planeData.width +
          houseData.lipInnerDistance * 2 +
          lodgeData.thickness * 2 +
          cubeData.gap * 2 -
          flooringData.width,
        // trim: true,
        maxLength:
          planeData.maxWidth +
          houseData.lipInnerDistance * 2 +
          lodgeData.thickness * 2 +
          cubeData.gap * 2,
        gap: flooringData.width + 0.01,
        axis: "x",
      });
    }
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
