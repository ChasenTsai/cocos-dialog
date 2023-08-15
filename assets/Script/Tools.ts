const newEventHandler = window["newEventHandler"] = (func, caller) => {
    let eh = new cc.Component.EventHandler();
    eh.emit = func.bind(caller);
    return eh;
}

const baseImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKBAMAAAB/HNKOAAAAFVBMVEUAAAD///////////////////////9Iz20EAAAABnRSTlMA875NhE4qVjv+AAAALUlEQVQI12NgMBJUZmBgSUtLc2AwA5LJDGpAMolBDEgmQkiICEQWqpIhCKgLAKOBDjUn2cGFAAAAAElFTkSuQmCC';
const loadSpf = window["loadSpf"] = () => {
    return new Promise<cc.SpriteFrame>(resolve => {
        cc.assetManager.loadRemote<cc.Texture2D>(baseImg, { ext: '.png' }, (err, asset) => {
            if (err) {
                cc.error(err);
                resolve(null);
                return;
            }
            const _spf = new cc.SpriteFrame(asset);
            _spf.insetTop = _spf.insetBottom = _spf.getRect().height / 2;
            _spf.insetLeft = _spf.insetRight = _spf.getRect().width / 2;
            resolve(_spf);
        })
    })
}

const Toast = window["Toast"] = (text: string | number = "", bg_color = cc.color(32, 32, 32)) => {
    const parent = cc.director.getScene().getComponentInChildren(cc.Canvas);

    const node = new cc.Node();
    parent.node.addChild(node);
    node.opacity = 220
    node.color = bg_color
    node.y = 0;
    node.x = 0;

    const label = new cc.Node().addComponent(cc.Label);
    node.addChild(label.node);
    label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
    label.verticalAlign = cc.Label.VerticalAlign.CENTER;
    label.fontSize = 22;
    label.string = String(text);
    label["_forceUpdateRenderData"]();
    // 当文本宽度过长时，设置为自动换行格式
    if (label.node.width > 400) {
        label.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        label.node.width = 300;
        label["_forceUpdateRenderData"]();
    }
    node.width = label.node.width + 60;
    node.height = label.node.height + 10;

    loadSpf().then(spf => {
        addSprite(node, spf);
    });

    cc.Tween.stopAllByTarget(node);
    cc.tween(node).set({ y: node.y - 100, opacity: 0 }).parallel(
        cc.tween().to(.2, { y: node.y }).to(.8, { y: node.y + 140 }),
        cc.tween().to(.1, { opacity: node.opacity }).delay(.8).to(.2, { opacity: 0 }),
    ).call(node.destroy.bind(node)).start();

    function addSprite(node: cc.Node, sf: cc.SpriteFrame) {
        const img = node.addComponent(cc.Sprite);
        img.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        img.type = cc.Sprite.Type.SLICED;
        img.spriteFrame = sf;
    }
}

const Dialog = window["Dialog"] = async (text: string | number = "", callback1: Function = undefined, callback2: Function = undefined) => {
    const parent = cc.director.getScene().getComponentInChildren(cc.Canvas).node;

    const node = new cc.Node();
    node.parent = parent;
    node.y = node.x = 0;
    setWidget(node, 0);

    const mask = new cc.Node();
    mask.parent = node;
    mask.opacity = 80;
    mask.color = cc.color(32, 32, 32);
    setWidget(mask, -100);
    mask.addComponent(cc.BlockInputEvents);

    // 先用mask把穿透拦截了，再加载图片资源
    const spf = await loadSpf();
    setSprite(mask, spf);

    const box = new cc.Node();
    box.parent = node;
    box.width = 300, box.height = 200;
    box.color = cc.color(238, 238, 238);
    setSprite(box, spf);

    const btn1 = new cc.Node();
    btn1.parent = node;
    btn1.width = 100, btn1.height = 46;
    btn1.x = -70, btn1.y = -60;
    btn1.color = cc.color(50, 100, 160);
    setSprite(btn1, spf);
    setScale(btn1);

    const btn2 = new cc.Node();
    btn2.parent = node;
    btn2.width = 100, btn2.height = 46;
    btn2.x = 70, btn2.y = -60;
    btn2.color = cc.color(80, 80, 80);
    setSprite(btn2, spf);
    setScale(btn2);

    const label = new cc.Node().addComponent(cc.Label);
    label.node.parent = node;
    label.node.width = 240, label.node.height = 100;
    label.node.y = 30;
    label.node.color = cc.color(32, 32, 32);
    setLabel(label, 22).overflow = cc.Label.Overflow.SHRINK;
    label.string = String(text);

    const label1 = new cc.Node().addComponent(cc.Label);
    label1.node.parent = btn1;
    label1.node.color = cc.color(255, 255, 255);
    setLabel(label1, 22);
    label1.string = "yes";

    const label2 = new cc.Node().addComponent(cc.Label);
    label2.node.parent = btn2;
    label2.node.color = cc.color(255, 255, 255);
    setLabel(label2, 22);
    label2.string = "no";

    if (callback2 === undefined) {
        btn2.active = label2.node.active = false;
        btn1.x = label1.node.x = 0;
    }

    showView();
    return node;

    function showView() {
        cc.Tween.stopAllByTarget(node);
        cc.tween(node).set({ opacity: 0, scale: .9 }).to(.2, { opacity: node.opacity, scale: 1 }).call(initEvent).start();
    }

    function closeView(e: cc.Event.EventTouch) {
        let callback = e.target?.["__touch_end_callback"];
        cc.tween(node).to(.1, { opacity: 0, scale: .95 }).call(() => {
            node.destroy();
            if (callback) callback();
        }).start();
    }

    function initEvent() {
        btn1["__touch_end_callback"] = callback1;
        btn1.once(cc.Node.EventType.TOUCH_END, closeView, this);
        btn2["__touch_end_callback"] = callback2;
        btn2.once(cc.Node.EventType.TOUCH_END, closeView, this);
    }


    /**
     * 添加一个贴边 widget
     * @param node 
     * @param margin 
     */
    function setWidget(node: cc.Node, margin: number = 0) {
        const widget = node.getComponent(cc.Widget) || node.addComponent(cc.Widget);
        widget.isAlignTop = widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = true;
        widget.top = widget.bottom = widget.left = widget.right = margin;
        widget.alignMode = cc.Widget.AlignMode.ON_WINDOW_RESIZE;
    }

    function setSprite(node: cc.Node, sf: cc.SpriteFrame) {
        const img = node.getComponent(cc.Sprite) || node.addComponent(cc.Sprite);
        img.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        img.type = cc.Sprite.Type.SLICED;
        img.spriteFrame = sf;
    }

    function setScale(node: cc.Node) {
        const btn = node.getComponent(cc.Button) || node.addComponent(cc.Button);
        btn.transition = cc.Button.Transition.SCALE;
        btn.zoomScale = .9;
    }

    function setLabel(label: cc.Label, fontSize: number) {
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.fontSize = fontSize;
        return label;
    }
} 