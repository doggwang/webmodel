
        // --- Focus Mode 处理 ---
        document.querySelectorAll('button:not([type])').forEach((button) => {
            button.type = 'button';
        });

        const prototypeSpec = JSON.parse(document.getElementById('prototype-spec').textContent);
        const urlParams = new URLSearchParams(window.location.search);
        const focusMode = urlParams.get('focus');
        const isSandbox = urlParams.get('sandbox') === 'true';
        const canvasContainer = document.getElementById('canvas-container');
        const loadingOverlay = document.getElementById('loading-overlay');
        const progressFill = document.getElementById('progress-fill');
        const btnRotate = document.getElementById('btn-rotate');
        const btnPan = document.getElementById('btn-pan');
        const btnMeasure = document.getElementById('btn-measure');
        const btnArea = document.getElementById('btn-area');
        const measureResultPanel = document.getElementById('measure-result');
        const areaResultPanel = document.getElementById('area-result');
        const sceneItems = Array.from(document.querySelectorAll('#scenes-bar > div'));
        const scenePresetMap = new Map(prototypeSpec.scenePresets.map((preset) => [preset.key, preset]));
        const labelPopups = document.querySelectorAll('.label-popup');

        if (focusMode) {
            // 隐藏除 focus 目标外的所有 UI
            document.querySelectorAll('.su-ui-panel').forEach(el => {
                if (el.id !== focusMode && !el.id.includes(focusMode)) {
                    el.classList.add('hidden-ui');
                }
            });
            if (isSandbox) {
                document.body.style.background = 'transparent';
                canvasContainer.style.background = 'transparent';
            }
        }

        // --- 加载模拟 ---
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    loadingOverlay.style.opacity = '0';
                    setTimeout(() => {
                        loadingOverlay.style.display = 'none';
                    }, 500);
                }, 500);
            }
            progressFill.style.width = progress + '%';
        }, 300);

        // --- Three.js 初始化 (模拟模型) ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        canvasContainer.appendChild(renderer.domElement);

        // 添加线框几何体模拟 SU 风格
        const geometry = new THREE.BoxGeometry(3, 2, 5);
        const material = new THREE.MeshPhongMaterial({ color: 0xf3f4f6, transparent: true, opacity: 0.8 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
        cube.add(line);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5).normalize();
        scene.add(light);
        scene.add(new THREE.AmbientLight(0x404040));

        camera.position.z = 8;
        camera.position.y = 3;

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.target.set(0, 0, 0);
        controls.update();

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();
        const labelAnchors = prototypeSpec.hotspots.map((hotspot) => ({
            id: hotspot.id,
            key: hotspot.key,
            position: new THREE.Vector3(...hotspot.anchor)
        }));
        let activePopupId = null;
        let measureWorldPoints = [];
        let measurements = [];
        let measurementIdCounter = 1;
        let areaDraftPoints = [];
        let areaDraftPointElements = [];
        let areaDraftLineElements = [];
        let areaDraftClosingLineElement = null;
        let areaMeasurements = [];
        let areaMeasurementIdCounter = 1;
        let activeMeasurementId = null;
        let activeAreaMeasurementId = null;
        const measurementLayer = document.getElementById('measurement-layer');
        const measurementDeleteButton = document.getElementById('measurement-delete-btn');
        const areaStatusElement = document.getElementById('area-status');
        const areaPointCountElement = document.getElementById('area-point-count');
        const areaFinishButton = document.getElementById('btn-area-finish');
        const areaClearButton = document.getElementById('btn-area-clear');

        function worldToScreen(worldPosition) {
            const projected = worldPosition.clone().project(camera);
            const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
            return { x, y, z: projected.z };
        }

        function updateLabelPositions() {
            labelAnchors.forEach(anchor => {
                const dot = document.getElementById(`label-${anchor.id}`);
                const popup = document.getElementById(`popup-${anchor.id}`);
                if (!dot || !popup) return;

                const worldPos = cube.localToWorld(anchor.position.clone());
                const screenPos = worldToScreen(worldPos);
                const visible = screenPos.z > -1 && screenPos.z < 1;

                dot.style.display = visible ? 'block' : 'none';
                if (!visible) {
                    popup.style.display = 'none';
                    return;
                }

                dot.style.left = `${screenPos.x}px`;
                dot.style.top = `${screenPos.y}px`;

                if (activePopupId === anchor.id) {
                    popup.style.left = `${screenPos.x + 18}px`;
                    popup.style.top = `${screenPos.y - 110}px`;
                }
            });
        }

        function setActiveMeasurement(id) {
            activeAreaMeasurementId = null;
            areaMeasurements.forEach(item => {
                item.badgeEl.classList.remove('active');
            });
            activeMeasurementId = id;
            const activeMeasurement = measurements.find(item => item.id === id);

            measurements.forEach(item => {
                if (!item.lineEl) return;
                item.lineEl.classList.toggle('active', item.id === activeMeasurementId);
            });

            if (activeMeasurement) {
                const midpoint = activeMeasurement.start.clone().add(activeMeasurement.end).multiplyScalar(0.5);
                const screenPos = worldToScreen(midpoint);
                measurementDeleteButton.style.display = 'block';
                measurementDeleteButton.style.left = `${screenPos.x}px`;
                measurementDeleteButton.style.top = `${screenPos.y - 26}px`;
            } else {
                measurementDeleteButton.style.display = 'none';
            }
        }

        function setActiveAreaMeasurement(id) {
            activeMeasurementId = null;
            measurements.forEach(item => {
                if (item.lineEl) item.lineEl.classList.remove('active');
            });
            activeAreaMeasurementId = id;
            const activeAreaMeasurement = areaMeasurements.find(item => item.id === id);
            areaMeasurements.forEach(item => {
                item.badgeEl.classList.toggle('active', item.id === activeAreaMeasurementId);
                item.lineEls.forEach(lineEl => lineEl.classList.toggle('active', item.id === activeAreaMeasurementId));
            });
            if (activeAreaMeasurement) {
                const screenPos = worldToScreen(activeAreaMeasurement.center);
                measurementDeleteButton.style.display = 'block';
                measurementDeleteButton.style.left = `${screenPos.x}px`;
                measurementDeleteButton.style.top = `${screenPos.y - 26}px`;
            } else {
                measurementDeleteButton.style.display = 'none';
            }
        }

        function createMeasurementItem(start, end) {
            const id = measurementIdCounter++;
            const item = {
                id,
                start: start.clone(),
                end: end.clone(),
                lineEl: document.createElement('button'),
                p1El: document.createElement('div'),
                p2El: document.createElement('div'),
                labelEl: document.createElement('div')
            };
            item.lineEl.type = 'button';
            item.lineEl.className = 'measurement-item-line';
            item.p1El.className = 'measurement-item-point';
            item.p2El.className = 'measurement-item-point';
            item.labelEl.className = 'measurement-item-label';
            item.lineEl.addEventListener('click', (ev) => {
                ev.stopPropagation();
                setActiveMeasurement(item.id);
            });
            measurementLayer.appendChild(item.lineEl);
            measurementLayer.appendChild(item.p1El);
            measurementLayer.appendChild(item.p2El);
            measurementLayer.appendChild(item.labelEl);
            measurements.push(item);
            return item;
        }

        function projectPointsToPlaneAndArea(points) {
            const center = new THREE.Vector3();
            points.forEach(point => center.add(point));
            center.multiplyScalar(1 / points.length);

            const normal = new THREE.Vector3();
            for (let i = 0; i < points.length; i++) {
                const current = points[i];
                const next = points[(i + 1) % points.length];
                normal.x += (current.y - next.y) * (current.z + next.z);
                normal.y += (current.z - next.z) * (current.x + next.x);
                normal.z += (current.x - next.x) * (current.y + next.y);
            }
            if (normal.lengthSq() < 1e-10) {
                normal.set(0, 1, 0);
            } else {
                normal.normalize();
            }

            const basisU = new THREE.Vector3();
            if (Math.abs(normal.y) > 0.8) {
                basisU.set(1, 0, 0);
            } else {
                basisU.set(0, 1, 0);
            }
            basisU.cross(normal).normalize();
            const basisV = normal.clone().cross(basisU).normalize();

            const projected = points.map(point => {
                const relative = point.clone().sub(center);
                return {
                    x: relative.dot(basisU),
                    y: relative.dot(basisV)
                };
            });

            let signedArea = 0;
            for (let i = 0; i < projected.length; i++) {
                const a = projected[i];
                const b = projected[(i + 1) % projected.length];
                signedArea += a.x * b.y - b.x * a.y;
            }
            const areaValue = Math.abs(signedArea) * 0.5;
            return { areaValue, center };
        }

        function clearAreaDraft() {
            areaDraftPointElements.forEach(element => element.remove());
            areaDraftLineElements.forEach(element => element.remove());
            if (areaDraftClosingLineElement) areaDraftClosingLineElement.remove();
            areaDraftPoints = [];
            areaDraftPointElements = [];
            areaDraftLineElements = [];
            areaDraftClosingLineElement = null;
            areaPointCountElement.textContent = '已选点位：0';
        }

        // 自动完成面积测量（当点击其他按钮时）
        function autoFinishAreaMeasurement() {
            if (areaDraftPoints.length >= 3) {
                const created = createAreaMeasurementItem(areaDraftPoints);
                setActiveAreaMeasurement(created.id);
                areaStatusElement.textContent = `已生成面积：${created.areaValue.toFixed(2)} m²`;
                clearAreaDraft();
                isAreaMeasurementCompleted = true;
            }
        }

        function addAreaDraftPoint(point) {
            const pointElement = document.createElement('div');
            pointElement.className = 'area-draft-point';
            measurementLayer.appendChild(pointElement);
            areaDraftPointElements.push(pointElement);
            areaDraftPoints.push(point.clone());
            areaPointCountElement.textContent = `已选点位：${areaDraftPoints.length}`;

            if (areaDraftPoints.length >= 2) {
                const lineElement = document.createElement('div');
                lineElement.className = 'area-draft-line';
                measurementLayer.appendChild(lineElement);
                areaDraftLineElements.push(lineElement);
            }
        }

        function createAreaMeasurementItem(points) {
            const { areaValue, center } = projectPointsToPlaneAndArea(points);
            const id = areaMeasurementIdCounter++;
            const item = {
                id,
                points: points.map(point => point.clone()),
                center: center.clone(),
                areaValue,
                badgeEl: document.createElement('button'),
                lineEls: [],
                pointEls: []
            };
            item.badgeEl.type = 'button';
            item.badgeEl.className = 'measurement-area-badge';
            item.badgeEl.addEventListener('click', (ev) => {
                ev.stopPropagation();
                setActiveAreaMeasurement(item.id);
            });
            for (let i = 0; i < item.points.length; i++) {
                const pointEl = document.createElement('div');
                pointEl.className = 'measurement-area-point';
                measurementLayer.appendChild(pointEl);
                item.pointEls.push(pointEl);

                const lineEl = document.createElement('div');
                lineEl.className = 'measurement-area-line';
                lineEl.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    setActiveAreaMeasurement(item.id);
                });
                measurementLayer.appendChild(lineEl);
                item.lineEls.push(lineEl);
            }
            measurementLayer.appendChild(item.badgeEl);
            areaMeasurements.push(item);
            return item;
        }

        function removeActiveMeasurement() {
            if (activeMeasurementId) {
                const index = measurements.findIndex(item => item.id === activeMeasurementId);
                if (index >= 0) {
                    const item = measurements[index];
                    item.lineEl.remove();
                    item.p1El.remove();
                    item.p2El.remove();
                    item.labelEl.remove();
                    measurements.splice(index, 1);
                }
                setActiveMeasurement(null);
                return;
            }
            if (activeAreaMeasurementId) {
                const index = areaMeasurements.findIndex(item => item.id === activeAreaMeasurementId);
                if (index >= 0) {
                    const item = areaMeasurements[index];
                    item.lineEls.forEach(element => element.remove());
                    item.pointEls.forEach(element => element.remove());
                    item.badgeEl.remove();
                    areaMeasurements.splice(index, 1);
                }
                setActiveAreaMeasurement(null);
            }
        }

        // 删除所有测量结果
        function clearAllMeasurements() {
            // 删除所有距离测量
            measurements.forEach(item => {
                item.lineEl.remove();
                item.p1El.remove();
                item.p2El.remove();
                item.labelEl.remove();
            });
            measurements = [];
            
            // 删除所有面积测量
            areaMeasurements.forEach(item => {
                item.lineEls.forEach(element => element.remove());
                item.pointEls.forEach(element => element.remove());
                item.badgeEl.remove();
            });
            areaMeasurements = [];
            
            // 清除选中状态
            setActiveMeasurement(null);
            setActiveAreaMeasurement(null);
            
            // 隐藏删除按钮
            measurementDeleteButton.style.display = 'none';
        }

        function updateStoredMeasurementsUI() {
            measurements.forEach((item, idx) => {
                const screenPoint1 = worldToScreen(item.start);
                const screenPoint2 = worldToScreen(item.end);
                const dx = screenPoint2.x - screenPoint1.x;
                const dy = screenPoint2.y - screenPoint1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                const midpointX = (screenPoint1.x + screenPoint2.x) / 2;
                const midpointY = (screenPoint1.y + screenPoint2.y) / 2;
                const mmDistance = Math.round(item.start.distanceTo(item.end) * 1000);

                item.lineEl.style.width = `${dist}px`;
                item.lineEl.style.left = `${screenPoint1.x}px`;
                item.lineEl.style.top = `${screenPoint1.y}px`;
                item.lineEl.style.transform = `rotate(${angle}deg)`;

                item.p1El.style.left = `${screenPoint1.x}px`;
                item.p1El.style.top = `${screenPoint1.y}px`;
                item.p2El.style.left = `${screenPoint2.x}px`;
                item.p2El.style.top = `${screenPoint2.y}px`;
                item.labelEl.style.left = `${midpointX}px`;
                item.labelEl.style.top = `${midpointY}px`;
                item.labelEl.textContent = `M${idx + 1} · ${mmDistance.toLocaleString()} mm`;
            });

            areaMeasurements.forEach((item, idx) => {
                const screenPoints = item.points.map(point => worldToScreen(point));
                screenPoints.forEach((screenPoint, pointIndex) => {
                    const next = screenPoints[(pointIndex + 1) % screenPoints.length];
                    const lineEl = item.lineEls[pointIndex];
                    const pointEl = item.pointEls[pointIndex];
                    const dx = next.x - screenPoint.x;
                    const dy = next.y - screenPoint.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    lineEl.style.width = `${dist}px`;
                    lineEl.style.left = `${screenPoint.x}px`;
                    lineEl.style.top = `${screenPoint.y}px`;
                    lineEl.style.transform = `rotate(${angle}deg)`;
                    pointEl.style.left = `${screenPoint.x}px`;
                    pointEl.style.top = `${screenPoint.y}px`;
                });
                const screenPos = worldToScreen(item.center);
                item.badgeEl.style.left = `${screenPos.x}px`;
                item.badgeEl.style.top = `${screenPos.y}px`;
                item.badgeEl.textContent = `A${idx + 1} · ${item.areaValue.toFixed(2)} m²`;
            });

            areaDraftPointElements.forEach((pointElement, idx) => {
                const screenPoint = worldToScreen(areaDraftPoints[idx]);
                pointElement.style.left = `${screenPoint.x}px`;
                pointElement.style.top = `${screenPoint.y}px`;
            });

            areaDraftLineElements.forEach((lineElement, idx) => {
                const start = worldToScreen(areaDraftPoints[idx]);
                const end = worldToScreen(areaDraftPoints[idx + 1]);
                const dx = end.x - start.x;
                const dy = end.y - start.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                lineElement.style.width = `${dist}px`;
                lineElement.style.left = `${start.x}px`;
                lineElement.style.top = `${start.y}px`;
                lineElement.style.transform = `rotate(${angle}deg)`;
            });

            if (areaDraftPoints.length >= 3) {
                if (!areaDraftClosingLineElement) {
                    areaDraftClosingLineElement = document.createElement('div');
                    areaDraftClosingLineElement.className = 'area-draft-line closing';
                    measurementLayer.appendChild(areaDraftClosingLineElement);
                }
                const first = worldToScreen(areaDraftPoints[0]);
                const last = worldToScreen(areaDraftPoints[areaDraftPoints.length - 1]);
                const dx = first.x - last.x;
                const dy = first.y - last.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                areaDraftClosingLineElement.style.width = `${dist}px`;
                areaDraftClosingLineElement.style.left = `${last.x}px`;
                areaDraftClosingLineElement.style.top = `${last.y}px`;
                areaDraftClosingLineElement.style.transform = `rotate(${angle}deg)`;
            } else if (areaDraftClosingLineElement) {
                areaDraftClosingLineElement.remove();
                areaDraftClosingLineElement = null;
            }

            if (activeMeasurementId) {
                const activeMeasurement = measurements.find(item => item.id === activeMeasurementId);
                if (!activeMeasurement) {
                    setActiveMeasurement(null);
                } else {
                    const midpoint = activeMeasurement.start.clone().add(activeMeasurement.end).multiplyScalar(0.5);
                    const screenPos = worldToScreen(midpoint);
                    measurementDeleteButton.style.left = `${screenPos.x}px`;
                    measurementDeleteButton.style.top = `${screenPos.y - 26}px`;
                }
            } else if (activeAreaMeasurementId) {
                const activeAreaMeasurement = areaMeasurements.find(item => item.id === activeAreaMeasurementId);
                if (!activeAreaMeasurement) {
                    setActiveAreaMeasurement(null);
                } else {
                    const screenPos = worldToScreen(activeAreaMeasurement.center);
                    measurementDeleteButton.style.left = `${screenPos.x}px`;
                    measurementDeleteButton.style.top = `${screenPos.y - 26}px`;
                }
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            updateLabelPositions();
            updateMeasureUI();
            updateStoredMeasurementsUI();
            renderer.render(scene, camera);
        }
        animate();

        // --- 交互功能 ---
        let isMeasuring = false;
        let isAreaMeasuring = false;
        let isAreaMeasurementCompleted = false; // 标记面积测量是否已完成
        const measureStatusElement = document.querySelector('#measure-result .text-xl');

        function setMode(mode) {
            btnRotate.classList.remove('active-tool');
            btnPan.classList.remove('active-tool');
            
            // 如果面积测量正在进行中，自动完成并保存
            if (isAreaMeasuring && areaDraftPoints.length >= 3) {
                autoFinishAreaMeasurement();
            }
            
            // 如果距离测量正在进行中，自动完成并保存
            if (isMeasuring && measureWorldPoints.length === 1) {
                // 只有一个点，取消测量
                measureWorldPoints = [];
                resetMeasureUI();
            }
            
            // 退出所有测量模式
            if (isMeasuring) {
                toggleMeasure();
            }
            if (isAreaMeasuring) {
                toggleAreaMeasure();
            }
            
            // 切换到对应的旋转/平移模式
            if (mode === 'rotate') {
                controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
                btnRotate.classList.add('active-tool');
            } else {
                controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
                btnPan.classList.add('active-tool');
            }
        }

        function toggleMeasure() {
            const panel = measureResultPanel;
            const btn = btnMeasure;
            const areaBtn = btnArea;
            const container = canvasContainer;
            
            // 如果面积测量正在进行中，自动完成并保存
            if (isAreaMeasuring && areaDraftPoints.length >= 3) {
                autoFinishAreaMeasurement();
            }
            
            if (!isMeasuring && isAreaMeasuring) {
                toggleAreaMeasure();
            }
            isMeasuring = !isMeasuring;
            
            if (isMeasuring) {
                panel.classList.remove('hidden');
                btn.classList.add('active-tool');
                areaBtn.classList.remove('active-tool');
                container.classList.add('measuring');
                measureWorldPoints = [];
                controls.enabled = false;
                setModeButtonEnabled(false);
                measureStatusElement.innerHTML = "请选择起点";
                measureStatusElement.classList.add('text-sm', 'font-normal');
            } else {
                // 只隐藏面板，不清除已保存的测量结果
                panel.classList.add('hidden');
                btn.classList.remove('active-tool');
                container.classList.remove('measuring');
                controls.enabled = true;
                setModeButtonEnabled(true);
                measureWorldPoints = [];
                resetMeasureUI();
                setActiveMeasurement(null);
                // 注意：不清除 measurements 数组，已保存的结果会保留
            }
        }

        function toggleAreaMeasure() {
            const panel = areaResultPanel;
            const btn = btnArea;
            const distanceBtn = btnMeasure;
            const container = canvasContainer;

            // 如果面积测量正在进行中，自动完成并保存
            if (isAreaMeasuring && areaDraftPoints.length >= 3) {
                autoFinishAreaMeasurement();
            }
            
            if (!isAreaMeasuring && isMeasuring) {
                toggleMeasure();
            }
            isAreaMeasuring = !isAreaMeasuring;
            isAreaMeasurementCompleted = false; // 重置完成状态

            if (isAreaMeasuring) {
                panel.classList.remove('hidden');
                btn.classList.add('active-tool');
                distanceBtn.classList.remove('active-tool');
                container.classList.add('measuring');
                controls.enabled = false;
                setModeButtonEnabled(false);
                clearAreaDraft();
                areaStatusElement.textContent = '请选择至少三个点';
            } else {
                // 只隐藏面板，不清除已保存的测量结果
                panel.classList.add('hidden');
                btn.classList.remove('active-tool');
                container.classList.remove('measuring');
                controls.enabled = true;
                setModeButtonEnabled(true);
                setActiveAreaMeasurement(null);
                // 只清除草稿，不清除已保存的测量结果
                clearAreaDraft();
                // 注意：不清除 areaMeasurements 数组，已保存的结果会保留
            }
        }

        function calculateFaceArea(intersection) {
            if (!intersection.face) return 0;
            const mesh = intersection.object;
            const geometry = mesh.geometry;
            const position = geometry.attributes.position;
            const index = geometry.index ? geometry.index.array : null;

            const targetNormal = intersection.face.normal.clone().transformDirection(mesh.matrixWorld).normalize();
            const planeD = targetNormal.dot(intersection.point);
            const getIndex = (i) => (index ? index[i] : i);
            const triangleCount = index ? index.length : position.count;
            let totalArea = 0;

            for (let i = 0; i < triangleCount; i += 3) {
                const ia = getIndex(i);
                const ib = getIndex(i + 1);
                const ic = getIndex(i + 2);
                const a = new THREE.Vector3().fromBufferAttribute(position, ia);
                const b = new THREE.Vector3().fromBufferAttribute(position, ib);
                const c = new THREE.Vector3().fromBufferAttribute(position, ic);
                mesh.localToWorld(a);
                mesh.localToWorld(b);
                mesh.localToWorld(c);

                const ab = b.clone().sub(a);
                const ac = c.clone().sub(a);
                const normalVec = ab.clone().cross(ac);
                const triArea = normalVec.length() * 0.5;
                if (triArea <= 0) continue;

                const triNormal = normalVec.normalize();
                if (triNormal.dot(targetNormal) < 0.995) continue;

                const da = Math.abs(targetNormal.dot(a) - planeD);
                const db = Math.abs(targetNormal.dot(b) - planeD);
                const dc = Math.abs(targetNormal.dot(c) - planeD);
                if (da < 0.001 && db < 0.001 && dc < 0.001) {
                    totalArea += triArea;
                }
            }

            return totalArea;
        }

        function setModeButtonEnabled(enabled) {
            // 不再禁用旋转和平移按钮，允许用户在测量模式下直接切换
            // btnRotate.disabled = !enabled;
            // btnPan.disabled = !enabled;
            btnRotate.style.opacity = enabled ? '1' : '0.6';
            btnPan.style.opacity = enabled ? '1' : '0.6';
            // btnRotate.style.pointerEvents = enabled ? 'auto' : 'none';
            // btnPan.style.pointerEvents = enabled ? 'auto' : 'none';
        }

        function updateMeasureUI() {
            const p1 = document.getElementById('measure-p1');
            const p2 = document.getElementById('measure-p2');
            const line = document.getElementById('measure-line');
            
            if (measureWorldPoints.length >= 1) {
                const screenPoint1 = worldToScreen(measureWorldPoints[0]);
                p1.style.display = 'block';
                p1.style.left = screenPoint1.x + 'px';
                p1.style.top = screenPoint1.y + 'px';
            } else {
                p1.style.display = 'none';
            }
            
            if (measureWorldPoints.length >= 2) {
                const screenPoint1 = worldToScreen(measureWorldPoints[0]);
                const screenPoint2 = worldToScreen(measureWorldPoints[1]);
                p2.style.display = 'block';
                p2.style.left = screenPoint2.x + 'px';
                p2.style.top = screenPoint2.y + 'px';
                
                line.style.display = 'block';
                const dx = screenPoint2.x - screenPoint1.x;
                const dy = screenPoint2.y - screenPoint1.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                
                line.style.width = dist + 'px';
                line.style.left = screenPoint1.x + 'px';
                line.style.top = screenPoint1.y + 'px';
                line.style.transform = `rotate(${angle}deg)`;
            } else {
                p2.style.display = 'none';
                line.style.display = 'none';
            }
        }

        function resetMeasureUI() {
            document.getElementById('measure-p1').style.display = 'none';
            document.getElementById('measure-p2').style.display = 'none';
            document.getElementById('measure-line').style.display = 'none';
        }

        renderer.domElement.addEventListener('pointerdown', (e) => {
            if (!isMeasuring && !isAreaMeasuring) return;
            e.preventDefault();
            e.stopPropagation();
            setActiveMeasurement(null);
            setActiveAreaMeasurement(null);
            
            const rect = renderer.domElement.getBoundingClientRect();
            pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObject(cube, false);

            if (!intersects.length) {
                if (isMeasuring) {
                    measureStatusElement.innerHTML = "请点击模型表面";
                    measureStatusElement.classList.add('text-sm', 'font-normal');
                }
                if (isAreaMeasuring) {
                    areaStatusElement.textContent = '请点击模型表面';
                }
                return;
            }

            if (isAreaMeasuring) {
                addAreaDraftPoint(intersects[0].point.clone());
                if (areaDraftPoints.length >= 3) {
                    const { areaValue } = projectPointsToPlaneAndArea(areaDraftPoints);
                    areaStatusElement.textContent = `预估面积：${areaValue.toFixed(2)} m²`;
                } else {
                    areaStatusElement.textContent = '继续选点，至少三个点';
                }
                return;
            }

            if (measureWorldPoints.length >= 2) measureWorldPoints = [];
            measureWorldPoints.push(intersects[0].point.clone());
            
            if (measureWorldPoints.length === 1) {
                measureStatusElement.innerHTML = "请选择终点";
                measureStatusElement.classList.add('text-sm', 'font-normal');
            } else if (measureWorldPoints.length === 2) {
                createMeasurementItem(measureWorldPoints[0], measureWorldPoints[1]);
                measureWorldPoints = [];
                resetMeasureUI();
                measureStatusElement.innerHTML = "已保留测量线，继续选择起点";
                measureStatusElement.classList.add('text-sm', 'font-normal');
            }
            updateMeasureUI();
        });

        measurementDeleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            removeActiveMeasurement();
        });

        areaFinishButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (areaDraftPoints.length < 3) {
                areaStatusElement.textContent = '至少三个点才能生成面积';
                return;
            }
            const created = createAreaMeasurementItem(areaDraftPoints);
            setActiveAreaMeasurement(created.id);
            areaStatusElement.textContent = `已生成面积：${created.areaValue.toFixed(2)} m²`;
            clearAreaDraft();
            isAreaMeasurementCompleted = true; // 标记面积测量已完成
        });

        areaClearButton.addEventListener('click', (e) => {
            e.stopPropagation();
            clearAreaDraft();
            areaStatusElement.textContent = '请选择至少三个点';
        });

        function switchScene(sceneKey) {
            const scenePreset = scenePresetMap.get(sceneKey);
            if (!scenePreset) {
                return;
            }

            camera.position.set(...scenePreset.cameraPosition);
            controls.target.set(...scenePreset.cameraTarget);
            controls.update();
            
            sceneItems.forEach((div) => {
                const label = div.querySelector('div:last-child');
                const img = div.querySelector('div:first-child');
                const isActive = div.dataset.sceneKey === sceneKey;
                if (isActive) {
                    label.classList.add('text-orange-600', 'font-bold');
                    img.classList.add('border-2', 'border-orange-500');
                } else {
                    label.classList.remove('text-orange-600', 'font-bold');
                    label.classList.add('text-gray-600');
                    img.classList.remove('border-2', 'border-orange-500');
                }
            });
        }
        function showPopup(id) {
            closePopups();
            const popup = document.getElementById(`popup-${id}`);
            activePopupId = id;
            popup.style.display = 'block';
            // 添加简单动画
            popup.style.opacity = '0';
            popup.style.transform = 'translateY(10px)';
            setTimeout(() => {
                popup.style.transition = 'all 0.3s ease';
                popup.style.opacity = '1';
                popup.style.transform = 'translateY(0)';
            }, 10);
        }

        function closePopups() {
            activePopupId = null;
            labelPopups.forEach(p => {
                p.style.display = 'none';
            });
        }

        // 点击空白处关闭弹窗
        window.addEventListener('mousedown', (e) => {
            if (!e.target.closest('.label-dot') && !e.target.closest('.label-popup')) {
                closePopups();
            }
            if (!e.target.closest('.measurement-item-line') && !e.target.closest('.measurement-area-line') && !e.target.closest('.measurement-area-badge') && !e.target.closest('.measurement-delete-btn')) {
                setActiveMeasurement(null);
                setActiveAreaMeasurement(null);
            }
        });

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            updateLabelPositions();
            updateMeasureUI();
            updateStoredMeasurementsUI();
        });
    