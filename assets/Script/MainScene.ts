const { ccclass, property } = cc._decorator;

@ccclass
export default class MainScene extends cc.Component {

    @property(cc.Button)
    btn_dialog: cc.Button = null;
    @property(cc.Button)
    btn_toast: cc.Button = null;

    start() {
        window["MainScene"] = this;

        this.initEvent();
    }

    private initEvent(): void {
        loadSpf().then(spf => {
            this.btn_dialog.getComponent(cc.Sprite).spriteFrame = spf;
            this.btn_toast.getComponent(cc.Sprite).spriteFrame = spf;
        });

        this.btn_dialog.clickEvents.push(newEventHandler(this.onDialogBtnClick, this))
        this.btn_toast.clickEvents.push(newEventHandler(this.onToastBtnClick, this))
    }

    private onDialogBtnClick(): void {
        Dialog("yes or no", () => { Toast("yes");console.log(this) }, () => { Toast("no") })
    }

    private onToastBtnClick(): void {
        Toast("this is Toast")
    }

}

