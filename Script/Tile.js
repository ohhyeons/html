import { CurrentGameState } from "./main.js";

export class Value {
    constructor(value) {
        this.value = value;
        this.isShield = false;
    }


    isEqual(value) {
        if (!isNaN(value)) {
            return this.value === value;
        } else if (value instanceof Value){
            return this.value === value.value;
        }
        return false;
    }
}

export class Tile {
    static isChanged;

    constructor(x, y, div) {
        this.x = x;
        this.y = y;
        this.div = div;

        this.topTile = null;
        this.bottomTile = null;
        this.rightTile = null;
        this.leftTile = null;

        this.isNumber = true;
        this.value = null;

        Tile.isChanged = false;
    }

    setTile(direction, tile){
        switch(direction){
            case "right":
                this.rightTile = tile;
                tile.leftTile = this;
                break;
            case "left":
                this.leftTile = tile;
                tile.rightTile = this;
                break;
            case "top":
                this.topTile = tile;
                tile.bottomTile = this;
                break;
            case "bottom":
                this.bottomTile = tile;
                tile.topTile = this;
                break;
            default:
                console.error(`failed to set tile ${this}  ${direction}`)

        }
    }

    useSkill(skill) {

    }

    insertTile(value) {
        this.setValue(new Value(value));
    }

    setValue(value){
        this.value = value;
        if (value === null || this.div.textContent === undefined){
            this.div.textContent = null;
        }else {
            this.div.textContent = value.value;
        }
        this.assignValue();
    }

    assignValue() {
        if(this.value === null)
            return;

        this.div.style=`color: ${this.value.isShield ? "red" : "black"}`;
    }

    mergeEffect() {
        setTimeout(() => {
            this.div.style.animation = "mergeEffect 0.4s ease-in-out";
        },0);
    }
    resetTilePosition() {
        setTimeout(() => {
            this.div.style.transition = "transform 0.2s ease-in-out";
            this.div.style.transform = "translate(0px, 0px)";
        }, 200); // 200ms 후 원래 위치로 복귀
    }

    /**
     * 합칠수있는지 확인
     * 
     * 합칠수 있는 경우 return true;
     */
    isMergeAble(tile1Val, tile2Val) {
        return tile1Val === tile2Val;
    }



    startCheckValueChange(value = null) {
        this.checkValue = [];
        if (value !== null) {
            this.checkValue.push(value);
        }
    }
    checkValueChange(value) {
        if (this.checkValue !== null || this.checkValue !== undefined) {
            this.checkValue.push(value);
        }
    }

    endCheckValueChange() {
        const result = !(this.checkValue === null || this.checkValue.length === 0 || this.checkValue.every(v => v.value === this.checkValue[0].value));
        this.checkValue = null;
        return
    }

    static merge(tile1Val, tile2Val) {
        let result = null; 
        let score = 0;
        if (isNaN(tile1Val.value)){
            switch(tile1Val){
            }
        } else {
            result = new Value(tile1Val.value + tile2Val.value);
            score = tile1Val.value + tile2Val.value;
        }
        return {result, score};
    }

    static mergeList(arr){
        if (!Array.isArray(arr)) {
            throw new TypeError('입력은 배열이어야 합니다.');
        }
        
        // 1. null이 아닌 value들을 원래 순서대로 추출
        const nonNullValues = arr.reduce((acc, instance) => {
            if (instance.value !== null) {
                acc.push(instance.value);
            }
            return acc;
        }, []);
        
        // 2. 좌측부터 인접한 같은 숫자 병합 (한 번 병합된 값은 재병합 불가)
        const mergedValues = [];
        for (let i = 0; i < nonNullValues.length; i++) {
            if (i < nonNullValues.length - 1 && nonNullValues[i].isEqual(nonNullValues[i + 1])) {
                //쉴드 스킬 사용 체크
                if(!(nonNullValues[i].isShield || nonNullValues[i+1].isShield)){
                    mergedValues.push(Tile.merge(nonNullValues[i], nonNullValues[i + 1]).result);
                } else {
                    //쉴드 제거
                    nonNullValues[i].isShield = false;
                    nonNullValues[i+1].isShield = false;
                    mergedValues.push(nonNullValues[i]);
                    mergedValues.push(nonNullValues[i+1]);
                }
                i++; // 병합에 사용된 다음 값을 건너뜀
            } else {
                mergedValues.push(nonNullValues[i]);
            }
        }
        
        // 3. 원래 배열의 참조 순서를 유지하며 value 업데이트:
        //    좌측부터 병합 결과를 할당하고, 나머지는 null로 설정
        for (let i = 0; i < arr.length; i++) {
            arr[i].setValue((i < mergedValues.length) ? mergedValues[i] : null);
        }
        return arr;
    }

    static simulateMergeList(arr){
        if (!Array.isArray(arr)) {
            throw new TypeError('입력은 배열이어야 합니다.');
        }
        let mergedScore = 0;
        
        // 1. null이 아닌 value들을 원래 순서대로 추출
        const nonNullValues = arr.reduce((acc, instance) => {
            if (instance.value !== null && instance.value !== undefined) {
                acc.push(instance.value);
            }
            return acc;
        }, []);

        
        // 2. 좌측부터 인접한 같은 숫자 병합 (한 번 병합된 값은 재병합 불가)
        for (let i = 0; i < nonNullValues.length; i++) {
            if (!nonNullValues[i].isEqual(arr[i].value))
                Tile.isChanged = true;
            if (i < nonNullValues.length - 1 && nonNullValues[i].isEqual(nonNullValues[i + 1])) {
                mergedScore += 1 + this.merge(nonNullValues[i], nonNullValues[i + 1]).score;
                Tile.isChanged = true;
                i++; // 병합에 사용된 다음 값을 건너뜀
            }
        }

        return mergedScore;
    }
}