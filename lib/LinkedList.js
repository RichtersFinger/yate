
//module.exports = 
class LinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }
    
    addToHead(value) {
        const newNode = { value };
        if (this.length === 0) {
		this.head = newNode;
		this.tail = newNode;
		this.head.next = newNode;
		this.tail.prev = newNode;
		this.tail.next = null;
		this.head.prev = null;
        } else {
		newNode.prev = null;
		newNode.next = this.head;
		this.head.prev = newNode;
		this.head = newNode;
        }
        this.length++;
        return this;
    }
    
    addToTail(value) {
        const newNode = { value };
        if (this.length === 0) {
		this.head = newNode;
		this.tail = newNode;
		this.head.next = newNode;
		this.tail.prev = newNode;
		this.tail.next = null;
		this.head.prev = null;
        } else {
		newNode.next = null;
		newNode.prev = this.tail;
		this.tail.next = newNode;
		this.tail = newNode;
        }
        this.length++;
        return this;
    }
    
    moveToTail(node) {
	if (node === this.tail) { // done
		return this;
	} else if (node === this.head) { // exclude prev null
		node.value.cardlayer = this.tail.value.cardlayer + 1;
		node.next.prev = node.prev;
		this.head = node.next;
		this.tail.next = node;
		node.prev = this.tail;
		node.next = null;
		this.tail = node;
	} else { //
		node.value.cardlayer = this.tail.value.cardlayer + 1;
		node.prev.next = node.next;
		node.next.prev = node.prev;
		this.tail.next = node;
		node.prev = this.tail;
		node.next = null;
		this.tail = node;
	}
	return this;
    }
    
    moveToHead(node) {
	if (node === this.head) { // done
		return this;
	} else if (node === this.tail) { // exclude prev null
		node.value.cardlayer = this.head.value.cardlayer - 1;
		node.prev.next = node.next;
		this.tail = node.prev;
		this.head.prev = node;
		node.next = this.head;
		node.prev = null;
		this.head = node;
	} else { //
		node.value.cardlayer = this.head.value.cardlayer - 1;
		node.next.prev = node.prev;
		node.prev.next = node.next;
		this.head.prev = node;
		node.next = this.head;
		node.prev = null;
		this.head = node;
	}
	return this;
    }
    
    removeFromHead() {
        if (this.length === 0) {
            return undefined;
        }
        
        const value = this.head.value;
        if (this.length === 1) {
		this.tail = null;
		this.head = null;
		this.length--;
        } else {
	        this.head = this.head.next;
	        this.head.prev = null;
	        this.length--;
        }
        
        return value;
    }
    
    removeFromTail() {
        if (this.length === 0) {
            return undefined;
        }
        
        const value = this.tail.value;
        if (this.length === 1) {
		this.tail = null;
		this.head = null;
		this.length--;
        } else {
		this.tail = this.tail.prev;
		this.tail.next = null;
		this.length--;
        }
        return value;
    }
    
    find(val) {
        let thisNode = this.head;
        
        while(thisNode) {
            if(thisNode.value === val) {
                return thisNode;
            }
            
            thisNode = thisNode.next;
        }
        
        return thisNode;
    }
    
    remove(val) {
        if(this.length === 0) {
            return undefined;
        }
        
        if (this.head.value === val) {
            return this.removeFromHead();
        }
        
        let previousNode = this.head;
        let thisNode = previousNode.next;
        
        while(thisNode) {
            if(thisNode.value === val) {
                break;
            }
            
            previousNode = thisNode;
            thisNode = thisNode.next;
        }
        
        if (thisNode === null) {
            return undefined;
        }
        
        previousNode.next = thisNode.next;
        this.length--;
        return this;
    }
}