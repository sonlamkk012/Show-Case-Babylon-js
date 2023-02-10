import {
    ActionManager,
    ArcRotateCamera, Color3,
    Engine,
    ExecuteCodeAction,
    float, Mesh,
    MeshBuilder, PBRMaterial, PointLight,
    Scene,
    SceneLoader,
    Vector3
} from "@babylonjs/core";
import "@babylonjs/loaders";
import "@babylonjs/gui"
import {AdvancedDynamicTexture, Button, ColorPicker, Control, Grid, StackPanel, TextBlock} from "@babylonjs/gui";
import {E_CarPart} from "@/enum/E_CarPart";

export class ShowCase {
    scene: Scene
    engine: Engine
    folderPath = "models/show_case/"
    bgFile = "BG_car.glb"
    // car = "h9.glb"
    carExtension = '.glb'
    defaultAlpha = -15
    defaultBeta = -12
    defaultRadius = -4
    defaultLowerRadiusLimit = 4.2
    defaultUpperRadiusLimit = 10

    // animation name
    bonnetNameAnimation = "capbo|Take 001|BaseLayer"
    bootNameAnimation = "cop|Take 001|BaseLayer"

    // animation name - door
    leftFrontDoorNameAnimation = "cuatruoc_lf|Take 001|BaseLayer"
    rightFrontDoorNameAnimation = "cuatruoc_rt|Take 001|BaseLayer"
    leftBackDoorNameAnimation = "cuasau_lf|Take 001|BaseLayer"
    rightBackDoorNameAnimation = "cuasau_rt|Take 001|BaseLayer"

    // animation name - wheel
    leftFrontWheelNameAnimation = "Wheel2|Take 001|BaseLayer"
    rightFrontWheelNameAnimation = "Wheel3|Take 001|BaseLayer"
    leftBackWheelNameAnimation = "Wheel1|Take 001|BaseLayer"
    rightBackWheelNameAnimation = "Wheel4|Take 001|BaseLayer"
    endOpen = 100
    speedRatio = 1
    openingSpeed = 1.5
    meshBeforeImport: any
    speedMovement = 0.3
    carUI: any
    startEngineBtnWidth = '150px'
    startEngineBtnHeight = '80px'
    startEngineBtnLeft = '10px'
    headLightsBtnWidth = '150px'
    headLightsBtnHeight = '80px'
    headLightsBtnLeft = '-100px'
    interiorBtnWidth = '100px'
    interiorEngineBtnHeight = '80px'
    interiorEngineBtnLeft = '60px'
    paintBtnWidth = '100px'
    paintEngineBtnHeight = '80px'
    paintEngineBtnLeft = '-20px'
    uiBtnColor = 'white'
    radius = 999
    bonnet?: Mesh
    boot?: Mesh
    leftBackDoor?: Mesh
    rightBackDoor?: Mesh
    leftFrontDoor?: Mesh
    rightFrontDoor?: Mesh
    mainStackHeight = '300px'
    buttonStackHeight = '100px'
    colorStackHeight = '200px'
    carName = ''

    constructor(private canvas: HTMLCanvasElement, carName: string) {
        this.carName = carName
        this.engine = new Engine(this.canvas, true)
        this.scene = this.CreateScene()
        this.CreateEnvironment()
        this.CreateGUI()
        this.CreateCar(carName)
        const resizeWatcher = new ResizeObserver(() => {
            this.engine.resize()
        })
        resizeWatcher.observe(canvas)
        this.engine.runRenderLoop(() => {
            this.scene.render()
        })
    }

    CreateScene(): Scene {
        const scene = new Scene(this.engine)
        this.CreateCamera(this.scene)
        scene.createDefaultEnvironment({createSkybox: false})
        scene.animationsEnabled = false
        scene.useOrderIndependentTransparency = true;
        return scene
    }

    CreateCamera(scene: Scene): void {
        const camera = new ArcRotateCamera("ArcRotateCamera", Math.PI / 4, Math.PI / 4,
            20, new Vector3(this.defaultAlpha, this.defaultBeta, this.defaultRadius), scene)
        camera.wheelPrecision = 50
        camera.setTarget(Vector3.Zero())
        camera.panningSensibility = 0;
        camera.attachControl()
        camera.speed = 0.25
        camera.upperBetaLimit = Math.PI / 2.5
        camera.lowerRadiusLimit = this.defaultLowerRadiusLimit
        camera.upperRadiusLimit = this.defaultUpperRadiusLimit
    }

    async CreateEnvironment(): Promise<void> {
        const {meshes, animationGroups} = await SceneLoader.ImportMeshAsync('', this.folderPath, this.bgFile)
    }

    async CreateCar(carName: string): Promise<void> {
        const carFileName = carName.concat(this.carExtension)
        const {meshes, animationGroups} = await SceneLoader.ImportMeshAsync('', this.folderPath, carFileName)
        this.meshBeforeImport = meshes
        this.bonnet = meshes[7] as Mesh
        this.boot = meshes[9] as Mesh
        this.leftBackDoor = meshes[31] as Mesh
        this.rightBackDoor = meshes[43] as Mesh
        this.leftFrontDoor = meshes[52] as Mesh
        this.rightFrontDoor = meshes[69] as Mesh
        this.CreateCylinderLeftFrontDoor(this.leftFrontDoor, this.scene, E_CarPart.LEFT_FRONT_DOOR, this.leftFrontDoorNameAnimation, this.bonnetNameAnimation, this.endOpen, -0.95, 0.9, 0, 0, 0, -90, this.openingSpeed)
        this.CreateCylinderLeftBackDoor(this.leftBackDoor, this.scene, E_CarPart.LEFT_BACK_DOOR, this.leftBackDoorNameAnimation, this.bonnetNameAnimation, this.endOpen, -0.95, 0.9, -0.9, 0, 0, -90, this.openingSpeed)
        this.CreateCylinderRightFrontDoor(this.rightFrontDoor, this.scene, E_CarPart.RIGHT_FRONT_DOOR, this.rightFrontDoorNameAnimation, this.bonnetNameAnimation, this.endOpen, 0.95, 0.9, 0, 0, 0, 90, this.openingSpeed)
        this.CreateCylinderRightBackDoor(this.rightBackDoor, this.scene, E_CarPart.RIGHT_BACK_DOOR, this.rightBackDoorNameAnimation, this.bonnetNameAnimation, this.endOpen, 0.95, 0.9, -0.9, 0, 0, 90, this.openingSpeed)
        this.CreateCylinderBonnet(this.bonnet, this.scene, E_CarPart.BONNET, this.bonnetNameAnimation, this.bonnetNameAnimation, this.endOpen, 0, 1, 2.3, 0, 0, 0, this.openingSpeed)
        this.CreateCylinderBoot(this.boot, this.scene, E_CarPart.BOOT, this.bootNameAnimation, this.bonnetNameAnimation, this.endOpen, 0, 1, -2.5, 90, 0, 0, this.openingSpeed)
    }

    async CreateGUI(): Promise<void> {
        let count = 0;
        let isOpenColorPanel = true
        const scene = this.scene

        const pbr = new PBRMaterial("pbr", scene);
        pbr.metallic = 1000;
        pbr.roughness = 1000;
        pbr.albedoColor = new Color3(1, 1, 1);

        // ui
        this.carUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        //main stack
        const mainStackPanel = new StackPanel();
        mainStackPanel.isVertical = true
        mainStackPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        mainStackPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        mainStackPanel.height = this.mainStackHeight
        mainStackPanel.width = '700px'

        // button stack panel
        const buttonPanel = new StackPanel();
        buttonPanel.isVertical = false
        buttonPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        buttonPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        buttonPanel.height = this.buttonStackHeight
        buttonPanel.width = '560px'
        buttonPanel.background = "Transparent"

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        buttonPanel._localDraw = (function() {
            const image = new Image();
            image.src = 'models/show_case/backgroundBtn.png';
            image.addEventListener('load', () => {
                buttonPanel._markAsDirty();
            });
            return function(context) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                context.drawImage(image, this._currentMeasure.left, this._currentMeasure.top, this._currentMeasure.width, this._currentMeasure.height);
            }
        })();

        const colorPanel = new StackPanel()
        colorPanel.isVertical = false
        colorPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        colorPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        colorPanel.height = this.colorStackHeight
        colorPanel.width = '400px'

        const tbMainColor = new TextBlock()
        tbMainColor.text = 'Main Color Picker'
        tbMainColor.color = this.uiBtnColor
        tbMainColor.fontSize = '14px'

        const tbSubColor = new TextBlock()
        tbSubColor.text = 'Sub Color Picker'
        tbSubColor.color = this.uiBtnColor
        tbSubColor.fontSize = '14px'

        const grid = new Grid()
        grid.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        grid.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        grid.height = this.colorStackHeight
        grid.width = '500px'
        grid.addColumnDefinition(150, true)
        grid.addColumnDefinition(150, true)
        grid.addRowDefinition(10, true)
        grid.addRowDefinition(190, true)

        const mainColorPicker = new ColorPicker()
        mainColorPicker.name = 'mainColorPicker'
        mainColorPicker.width = '120px'

        const subColorPicker = new ColorPicker()
        subColorPicker.name = 'subColorPicker'
        subColorPicker.width = '120px'

        const trickPanel = new StackPanel()
        trickPanel.isVertical = false
        trickPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        trickPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        trickPanel.height = this.colorStackHeight
        trickPanel.width = '400px'

        colorPanel.isVisible = false

        // all button
        //start engine
        const startEngineBtn = Button.CreateSimpleButton("startEngineBtn", "Start Engine")
        startEngineBtn.width = this.startEngineBtnWidth
        startEngineBtn.height = this.startEngineBtnHeight
        startEngineBtn.cornerRadius = this.radius
        startEngineBtn.color = this.uiBtnColor
        startEngineBtn.left = this.startEngineBtnLeft
        startEngineBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
        startEngineBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
        startEngineBtn.hoverCursor = "pointer"
        startEngineBtn.thickness = 0
        startEngineBtn.paddingLeft = 50

        // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // // @ts-ignore
        // startEngineBtn._localDraw = (function() {
        //     const image = new Image();
        //     image.src = 'models/show_case/Start.png';
        //     image.addEventListener('load', () => {
        //         buttonPanel._markAsDirty();
        //     });
        //     return function(context) {
        //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //         // @ts-ignore
        //         context.drawImage(image, this._currentMeasure.left, this._currentMeasure.top, this._currentMeasure.width, this._currentMeasure.height);
        //     }
        // })();

        // headlights
        const headLightsBtn = Button.CreateSimpleButton("headLightsBtn", "Head Light")
        headLightsBtn.width = this.headLightsBtnWidth
        headLightsBtn.height = this.headLightsBtnHeight
        headLightsBtn.cornerRadius = this.radius
        headLightsBtn.color = this.uiBtnColor
        headLightsBtn.left = this.headLightsBtnLeft
        headLightsBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
        headLightsBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
        headLightsBtn.hoverCursor = "pointer"
        headLightsBtn.thickness = 0
        headLightsBtn.paddingLeft = 50

        // paint
        const paintBtn = Button.CreateSimpleButton("paintBtn", "Paint")
        paintBtn.width = this.paintBtnWidth
        paintBtn.height = this.paintEngineBtnHeight
        paintBtn.cornerRadius = this.radius
        paintBtn.color = this.uiBtnColor
        paintBtn.left = this.paintEngineBtnLeft
        paintBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
        paintBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
        paintBtn.hoverCursor = "pointer";
        paintBtn.thickness = 0
        paintBtn.paddingLeft = 50

        // interior
        const interiorBtn = Button.CreateSimpleButton("interiorBtn", "Interior")
        interiorBtn.width = this.interiorBtnWidth
        interiorBtn.height = this.interiorEngineBtnHeight
        interiorBtn.cornerRadius = this.radius
        interiorBtn.color = this.uiBtnColor
        interiorBtn.left = this.interiorEngineBtnLeft
        interiorBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
        interiorBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
        interiorBtn.hoverCursor = "pointer";
        interiorBtn.thickness = 0
        interiorBtn.paddingLeft = 50

        // action to start engine button
        startEngineBtn.onPointerDownObservable.add(() => {
            const rightBackWheelAnimation = scene.getAnimationGroupByName(this.rightBackWheelNameAnimation)
            const leftBackWheelAnimation = scene.getAnimationGroupByName(this.leftBackWheelNameAnimation)
            const rightFrontWheelAnimation = scene.getAnimationGroupByName(this.rightFrontWheelNameAnimation)
            const leftFrontWheelAnimation = scene.getAnimationGroupByName(this.leftFrontWheelNameAnimation)
            const bonnetAnimation = scene.getAnimationGroupByName(this.bonnetNameAnimation);
            if (count == 0) {
                bonnetAnimation?.stop()
                scene.animationsEnabled = true
                rightBackWheelAnimation?.start(true, this.speedRatio, rightBackWheelAnimation?.from, rightBackWheelAnimation?.to, false)
                leftBackWheelAnimation?.start(true, this.speedRatio, leftBackWheelAnimation?.from, leftBackWheelAnimation?.to, false)
                rightFrontWheelAnimation?.start(true, this.speedRatio, rightFrontWheelAnimation?.from, rightFrontWheelAnimation?.to, false)
                leftFrontWheelAnimation?.start(true, this.speedRatio, leftFrontWheelAnimation?.from, leftFrontWheelAnimation?.to, false)
                count = 1
            } else {
                bonnetAnimation?.stop()
                rightBackWheelAnimation?.stop()
                leftBackWheelAnimation?.stop()
                rightFrontWheelAnimation?.stop()
                leftFrontWheelAnimation?.stop()
                scene.animationsEnabled = false
                count = 0
            }
        })

        // action to paint button
        paintBtn.onPointerClickObservable.add(() => {
            if (isOpenColorPanel == false) {
                colorPanel.isVisible = true
                trickPanel.isVisible = false
                isOpenColorPanel = true
            } else {
                colorPanel.isVisible = false
                trickPanel.isVisible = true
                isOpenColorPanel = false
            }
        })

        // action to interior button
        interiorBtn.onPointerClickObservable.add(() => {
            alert('Interior Button')
        })

        // action to headlight button
        headLightsBtn.onPointerClickObservable.add(() => {
            alert('Headlight Button')
        })

        // add button to panel
        buttonPanel.addControl(startEngineBtn)
        buttonPanel.addControl(headLightsBtn)
        buttonPanel.addControl(paintBtn)
        buttonPanel.addControl(interiorBtn)

        // color panel
        grid.addControl(tbMainColor, 0, 0)
        grid.addControl(tbSubColor, 0, 1)
        grid.addControl(mainColorPicker, 1, 0)
        grid.addControl(subColorPicker, 1, 1)
        colorPanel.addControl(grid)

        //add to UI
        mainStackPanel.addControl(colorPanel)
        mainStackPanel.addControl(trickPanel)
        mainStackPanel.addControl(buttonPanel)
        this.carUI.addControl(mainStackPanel)

        this.ColorPicker(mainColorPicker, scene, pbr, false)
        this.ColorPicker(subColorPicker, scene, pbr, true)
    }

    ColorPicker(colorPicker: ColorPicker, scene: Scene, pbr: PBRMaterial, isSubColor: boolean): void {
        const result = scene.meshes[0]
        result.material = pbr
        if (isSubColor == false) {
            colorPicker.onValueChangedObservable.add(function (value) {
                for (let i = 0; i < scene.materials.length; i++) {
                    const mat = scene.materials[i]
                    if (mat.name === 'Material') {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        mat._albedoColor = value
                    }
                }
            })
        } else {
            colorPicker.onValueChangedObservable.add(function (value) {
                for (let i = 0; i < scene.materials.length; i++) {
                    const mat = scene.materials[i]
                    if (mat.name === 'Material.003') {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        mat._albedoColor = value
                    }
                }
            })
        }
    }

    CreateCylinderBonnet(mesh: Mesh, scene: Scene, name: string, animationName: string, animationStopName: string, endClose: float, positionX: float, positionY: float, positionZ: float, rotationX: float, rotationY: float, rotationZ: float, speedRatio: float): void {
        const cylinderName = name.concat('Cylinder')
        const pointLightName = name.concat('Light')
        const cylinder = MeshBuilder.CreateCylinder(cylinderName, {height: 0.0001, diameter: 0.1})
        cylinder.position.x = positionX
        cylinder.position.y = positionY
        cylinder.position.z = positionZ
        cylinder.rotation.x = rotationX
        cylinder.rotation.y = rotationY
        cylinder.rotation.z = rotationZ
        const pointLight = new PointLight(pointLightName, new Vector3(1, 20, 1), scene)
        let isOpen = false
        cylinder.actionManager = new ActionManager(scene);
        cylinder.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickUpTrigger, function () {
            scene.animationsEnabled = true
            if (animationStopName.length != 0 || animationStopName != '') {
                const disableAnimation = scene.getAnimationGroupByName(animationStopName)
                disableAnimation?.stop()
            }
            if (isOpen == false) {
                const animation = scene.getAnimationGroupByName(animationName)
                animation?.start(false, speedRatio, animation?.from, endClose, false)
                isOpen = true
            } else {
                const animation = scene.getAnimationGroupByName(animationName)
                animation?.start(false, speedRatio, endClose, animation?.to, false)
                isOpen = false
            }
        }))
        scene.animationsEnabled = false
    }

    CreateCylinderBoot(mesh: Mesh, scene: Scene, name: string, animationName: string, animationStopName: string, endClose: float, positionX: float, positionY: float, positionZ: float, rotationX: float, rotationY: float, rotationZ: float, speedRatio: float): void {
        const cylinderName = name.concat('Cylinder')
        const pointLightName = name.concat('Light')
        const cylinder = MeshBuilder.CreateCylinder(cylinderName, {height: 0.0001, diameter: 0.1})
        cylinder.position.x = positionX
        cylinder.position.y = positionY
        cylinder.position.z = positionZ
        cylinder.rotation.x = rotationX
        cylinder.rotation.y = rotationY
        cylinder.rotation.z = rotationZ
        const pointLight = new PointLight(pointLightName, new Vector3(1, 20, 1), scene)
        let isOpen = false
        cylinder.actionManager = new ActionManager(scene);
        cylinder.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickUpTrigger, function () {
            scene.animationsEnabled = true
            if (animationStopName.length != 0 || animationStopName != '') {
                const disableAnimation = scene.getAnimationGroupByName(animationStopName)
                disableAnimation?.stop()
            }
            if (isOpen == false) {
                const animation = scene.getAnimationGroupByName(animationName)
                animation?.start(false, speedRatio, animation?.from, endClose, false)
                isOpen = true
            } else {
                const animation = scene.getAnimationGroupByName(animationName)
                animation?.start(false, speedRatio, endClose, animation?.to, false)
                isOpen = false
            }
        }))
        scene.animationsEnabled = false
    }

    CreateCylinderLeftBackDoor(mesh: Mesh, scene: Scene, name: string, animationName: string, animationStopName: string, endClose: float, positionX: float, positionY: float, positionZ: float, rotationX: float, rotationY: float, rotationZ: float, speedRatio: float): void {
        const cylinderName = name.concat('Cylinder')
        const pointLightName = name.concat('Light')
        const cylinder = MeshBuilder.CreateCylinder(cylinderName, {height: 0.0001, diameter: 0.1})
        cylinder.position.x = positionX
        cylinder.position.y = positionY
        cylinder.position.z = positionZ
        cylinder.rotation.x = rotationX
        cylinder.rotation.y = rotationY
        cylinder.rotation.z = rotationZ
        const pointLight = new PointLight(pointLightName, new Vector3(1, 20, 1), scene)
        let isOpen = false
        cylinder.actionManager = new ActionManager(scene);
        cylinder.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickUpTrigger, function () {
            scene.animationsEnabled = true
            if (animationStopName.length != 0 || animationStopName != '') {
                const disableAnimation = scene.getAnimationGroupByName(animationStopName)
                disableAnimation?.stop()
            }
            if (isOpen == false) {
                const animation = scene.getAnimationGroupByName(animationName)
                animation?.start(false, speedRatio, animation?.from, endClose, false)
                isOpen = true
            } else {
                const animation = scene.getAnimationGroupByName(animationName)
                animation?.start(false, speedRatio, endClose, animation?.to, false)
                isOpen = false
            }
        }))
        scene.animationsEnabled = false
    }

    CreateCylinderLeftFrontDoor(mesh: Mesh, scene: Scene, name: string, animationName: string, animationStopName: string, endClose: float, positionX: float, positionY: float, positionZ: float, rotationX: float, rotationY: float, rotationZ: float, speedRatio: float): void {
        const cylinderName = name.concat('Cylinder')
        const pointLightName = name.concat('Light')
        const cylinder = MeshBuilder.CreateCylinder(cylinderName, {height: 0.0001, diameter: 0.1})
        cylinder.position.x = positionX
        cylinder.position.y = positionY
        cylinder.position.z = positionZ
        cylinder.rotation.x = rotationX
        cylinder.rotation.y = rotationY
        cylinder.rotation.z = rotationZ
        const pointLight = new PointLight(pointLightName, new Vector3(1, 20, 1), scene)
        let isOpen = false
        cylinder.actionManager = new ActionManager(scene);
        cylinder.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickUpTrigger, function () {
            scene.animationsEnabled = true
            if (animationStopName.length != 0 || animationStopName != '') {
                const disableAnimation = scene.getAnimationGroupByName(animationStopName)
                disableAnimation?.stop()
            }
            if (isOpen == false) {
                const animation = scene.getAnimationGroupByName(animationName)
                animation?.start(false, speedRatio, animation?.from, endClose, false)
                isOpen = true
            } else {
                const animation = scene.getAnimationGroupByName(animationName)
                animation?.start(false, speedRatio, endClose, animation?.to, false)
                isOpen = false
            }
        }))
        scene.animationsEnabled = false
    }

    CreateCylinderRightBackDoor(mesh: Mesh, scene: Scene, name: string, animationName: string, animationStopName: string, endClose: float, positionX: float, positionY: float, positionZ: float, rotationX: float, rotationY: float, rotationZ: float, speedRatio: float): void {
        const cylinderName = name.concat('Cylinder')
        const pointLightName = name.concat('Light')
        const cylinder = MeshBuilder.CreateCylinder(cylinderName, {height: 0.0001, diameter: 0.1})
        cylinder.position.x = positionX
        cylinder.position.y = positionY
        cylinder.position.z = positionZ
        cylinder.rotation.x = rotationX
        cylinder.rotation.y = rotationY
        cylinder.rotation.z = rotationZ
        const pointLight = new PointLight(pointLightName, new Vector3(1, 20, 1), scene)
        let isOpen = false
        cylinder.actionManager = new ActionManager(scene);
        cylinder.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickUpTrigger, function () {
            scene.animationsEnabled = true
            if (animationStopName.length != 0 || animationStopName != '') {
                const disableAnimation = scene.getAnimationGroupByName(animationStopName)
                disableAnimation?.stop()
            }
            if (isOpen == false) {
                const animation = scene.getAnimationGroupByName(animationName)
                animation?.start(false, speedRatio, animation?.from, endClose, false)
                isOpen = true
            } else {
                const animation = scene.getAnimationGroupByName(animationName)
                animation?.start(false, speedRatio, endClose, animation?.to, false)
                isOpen = false
            }
        }))
        scene.animationsEnabled = false
    }

    CreateCylinderRightFrontDoor(mesh: Mesh, scene: Scene, name: string, animationName: string, animationStopName: string, endClose: float, positionX: float, positionY: float, positionZ: float, rotationX: float, rotationY: float, rotationZ: float, speedRatio: float): void {
        const cylinderName = name.concat('Cylinder')
        const pointLightName = name.concat('Light')
        const cylinder = MeshBuilder.CreateCylinder(cylinderName, {height: 0.0001, diameter: 0.1})
        cylinder.position.x = positionX
        cylinder.position.y = positionY
        cylinder.position.z = positionZ
        cylinder.rotation.x = rotationX
        cylinder.rotation.y = rotationY
        cylinder.rotation.z = rotationZ
        const pointLight = new PointLight(pointLightName, new Vector3(1, 20, 1), scene)
        let isOpen = false
        cylinder.actionManager = new ActionManager(scene);
        cylinder.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickUpTrigger, function () {
            scene.animationsEnabled = true
            if (animationStopName.length != 0 || animationStopName != '') {
                const disableAnimation = scene.getAnimationGroupByName(animationStopName)
                disableAnimation?.stop()
            }
            if (isOpen == false) {
                const animation = scene.getAnimationGroupByName(animationName)
                animation?.start(false, speedRatio, animation?.from, endClose, false)
                isOpen = true
            } else {
                const animation = scene.getAnimationGroupByName(animationName)
                animation?.start(false, speedRatio, endClose, animation?.to, false)
                isOpen = false
            }
        }))
        scene.animationsEnabled = false
    }
}
