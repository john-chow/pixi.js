const { Container, DisplayObject } = require('../');

function testAddChild(fn)
{
    return function ()
    {
        fn(function (container, obj)
        {
            container.addChild(obj);
        });
        fn(function (container, obj)
        {
            container.addChildAt(obj);
        });
    };
}

function testRemoveChild(fn)
{
    return function ()
    {
        fn(function (container, obj)
        {
            container.removeChild(obj);
        });
        fn(function (container, obj)
        {
            container.removeChildAt(container.children.indexOf(obj));
        });
        fn(function (container, obj)
        {
            container.removeChildren(container.children.indexOf(obj), container.children.indexOf(obj) + 1);
        });
    };
}

describe('PIXI.Container', function ()
{
    describe('parent', function ()
    {
        it('should be present when adding children to Container', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            expect(container.children.length).to.be.equals(0);
            container.addChild(child);
            expect(container.children.length).to.be.equals(1);
            expect(child.parent).to.be.equals(container);
        });
    });

    describe('addChild', function ()
    {
        it('should remove from current parent', function ()
        {
            const parent = new Container();
            const container = new Container();
            const child = new DisplayObject();

            assertRemovedFromParent(parent, container, child, () => { container.addChild(child); });
        });

        it('should call onChildrenChange', function ()
        {
            const container = new Container();
            const child = new DisplayObject();
            const spy = sinon.spy(container, 'onChildrenChange');

            container.addChild(child);

            expect(spy).to.have.been.called;
            expect(spy).to.have.been.calledWith(0);
        });

        it('should flag child transform and container bounds for recalculation', testAddChild(function (mockAddChild)
        {
            const container = new Container();
            const child = new Container();

            container.getBounds();
            child.getBounds();

            const boundsID = container._boundsID;
            const childParentID = child.transform._parentID;

            mockAddChild(container, child);

            expect(boundsID).to.not.be.equals(container._boundsID);
            expect(childParentID).to.not.be.equals(child.transform._parentID);
        }));
    });

    describe('removeChildAt', function ()
    {
        it('should remove from current parent', function ()
        {
            const parent = new Container();
            const child = new DisplayObject();

            assertRemovedFromParent(parent, null, child, () => { parent.removeChildAt(0); });
        });

        it('should call onChildrenChange', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(child);

            const spy = sinon.spy(container, 'onChildrenChange');

            container.removeChildAt(0);
            expect(spy).to.have.been.called;
            expect(spy).to.have.been.calledWith(0);
        });
    });

    describe('addChildAt', function ()
    {
        it('should allow placements at start', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(new DisplayObject());
            container.addChildAt(child, 0);

            expect(container.children.length).to.be.equals(2);
            expect(container.children[0]).to.be.equals(child);
        });

        it('should allow placements at end', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(new DisplayObject());
            container.addChildAt(child, 1);

            expect(container.children.length).to.be.equals(2);
            expect(container.children[1]).to.be.equals(child);
        });

        it('should throw on out-of-bounds', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(new DisplayObject());

            expect(() => container.addChildAt(child, -1)).to.throw('The index -1 supplied is out of bounds 1');
            expect(() => container.addChildAt(child, 2)).to.throw('The index 2 supplied is out of bounds 1');
        });

        it('should remove from current parent', function ()
        {
            const parent = new Container();
            const container = new Container();
            const child = new DisplayObject();

            assertRemovedFromParent(parent, container, child, () => { container.addChildAt(child, 0); });
        });

        it('should call onChildrenChange', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(new DisplayObject());

            const spy = sinon.spy(container, 'onChildrenChange');

            container.addChildAt(child, 0);

            expect(spy).to.have.been.called;
            expect(spy).to.have.been.calledWith(0);
        });
    });

    describe('removeChild', function ()
    {
        it('should ignore non-children', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(child);

            container.removeChild(new DisplayObject());

            expect(container.children.length).to.be.equals(1);
        });

        it('should remove all children supplied', function ()
        {
            const container = new Container();
            const child1 = new DisplayObject();
            const child2 = new DisplayObject();

            container.addChild(child1, child2);

            expect(container.children.length).to.be.equals(2);

            container.removeChild(child1, child2);

            expect(container.children.length).to.be.equals(0);
        });

        it('should call onChildrenChange', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(child);

            const spy = sinon.spy(container, 'onChildrenChange');

            container.removeChild(child);

            expect(spy).to.have.been.called;
            expect(spy).to.have.been.calledWith(0);
        });

        it('should flag transform for recalculation', testRemoveChild(function (mockRemoveChild)
        {
            const container = new Container();
            const child = new Container();

            container.addChild(child);
            container.getBounds();

            const childParentID = child.transform._parentID;
            const boundsID = container._boundsID;

            mockRemoveChild(container, child);

            expect(childParentID).to.not.be.equals(child.transform._parentID);
            expect(boundsID).to.not.be.equals(container._boundsID);
        }));
    });

    describe('getChildIndex', function ()
    {
        it('should return the correct index', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(new DisplayObject(), child, new DisplayObject());

            expect(container.getChildIndex(child)).to.be.equals(1);
        });

        it('should throw when child does not exist', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            expect(() => container.getChildIndex(child))
                .to.throw('The supplied DisplayObject must be a child of the caller');
        });
    });

    describe('getChildAt', function ()
    {
        it('should throw when out-of-bounds', function ()
        {
            const container = new Container();

            expect(() => container.getChildAt(-1)).to.throw('getChildAt: Index (-1) does not exist.');
            expect(() => container.getChildAt(1)).to.throw('getChildAt: Index (1) does not exist.');
        });
    });

    describe('setChildIndex', function ()
    {
        it('should throw on out-of-bounds', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(child);

            expect(() => container.setChildIndex(child, -1)).to.throw('The supplied index is out of bounds');
            expect(() => container.setChildIndex(child, 1)).to.throw('The supplied index is out of bounds');
        });

        it('should throw when child does not belong', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(new DisplayObject());

            expect(() => container.setChildIndex(child, 0))
                .to.throw('The supplied DisplayObject must be a child of the caller');
        });

        it('should set index', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(child, new DisplayObject(), new DisplayObject());
            expect(container.children.indexOf(child)).to.be.equals(0);

            container.setChildIndex(child, 1);
            expect(container.children.indexOf(child)).to.be.equals(1);

            container.setChildIndex(child, 2);
            expect(container.children.indexOf(child)).to.be.equals(2);

            container.setChildIndex(child, 0);
            expect(container.children.indexOf(child)).to.be.equals(0);
        });

        it('should call onChildrenChange', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(child, new DisplayObject());

            const spy = sinon.spy(container, 'onChildrenChange');

            container.setChildIndex(child, 1);

            expect(spy).to.have.been.called;
            expect(spy).to.have.been.calledWith(1);
        });
    });

    describe('swapChildren', function ()
    {
        it('should call onChildrenChange', function ()
        {
            const container = new Container();
            const child1 = new DisplayObject();
            const child2 = new DisplayObject();

            container.addChild(child1, child2);

            const spy = sinon.spy(container, 'onChildrenChange');

            container.swapChildren(child1, child2);
            expect(spy).to.have.been.called;
            expect(spy).to.have.been.calledWith(0);

            // second call required to complete returned index coverage
            container.swapChildren(child1, child2);
            expect(spy).to.have.been.calledTwice;
            expect(spy).to.have.been.calledWith(0);
        });

        it('should not call onChildrenChange if supplied children are equal', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(child, new DisplayObject());

            const spy = sinon.spy(container, 'onChildrenChange');

            container.swapChildren(child, child);

            expect(spy).to.not.have.been.called;
        });

        it('should throw if children do not belong', function ()
        {
            const container = new Container();
            const child = new Container();

            container.addChild(child, new DisplayObject());

            expect(() => container.swapChildren(child, new DisplayObject()))
                .to.throw('The supplied DisplayObject must be a child of the caller');
            expect(() => container.swapChildren(new DisplayObject(), child))
                .to.throw('The supplied DisplayObject must be a child of the caller');
        });

        it('should result in swapped child positions', function ()
        {
            const container = new Container();
            const child1 = new DisplayObject();
            const child2 = new DisplayObject();

            container.addChild(child1, child2);

            expect(container.children.indexOf(child1)).to.be.equals(0);
            expect(container.children.indexOf(child2)).to.be.equals(1);

            container.swapChildren(child1, child2);

            expect(container.children.indexOf(child2)).to.be.equals(0);
            expect(container.children.indexOf(child1)).to.be.equals(1);
        });
    });

    describe('render', function ()
    {
        it('should not render when object not visible', function ()
        {
            const container = new Container();
            const webGLSpy = sinon.spy(container._render);

            container.visible = false;

            container.render();
            expect(webGLSpy).to.not.have.been.called;
        });

        it('should not render when alpha is zero', function ()
        {
            const container = new Container();
            const webGLSpy = sinon.spy(container._render);

            container.worldAlpha = 0;

            container.render();
            expect(webGLSpy).to.not.have.been.called;
        });

        it('should not render when object not renderable', function ()
        {
            const container = new Container();
            const webGLSpy = sinon.spy(container._render);

            container.renderable = false;

            container.render();
            expect(webGLSpy).to.not.have.been.called;
        });

        it('should render children', function ()
        {
            const container = new Container();
            const child = new Container();
            const webGLSpy = sinon.spy(child, '_render');

            container.addChild(child);

            container.render();
            expect(webGLSpy).to.have.been.called;
        });
    });

    describe('removeChildren', function ()
    {
        it('should remove all children when no arguments supplied', function ()
        {
            const container = new Container();
            let removed = [];

            container.addChild(new DisplayObject(), new DisplayObject(), new DisplayObject());

            expect(container.children.length).to.be.equals(3);

            removed = container.removeChildren();

            expect(container.children.length).to.be.equals(0);
            expect(removed.length).to.be.equals(3);
        });

        it('should return empty array if no children', function ()
        {
            const container = new Container();
            const removed = container.removeChildren();

            expect(removed.length).to.be.equals(0);
        });

        it('should handle a range greater than length', function ()
        {
            const container = new Container();
            let removed = [];

            container.addChild(new DisplayObject());

            removed = container.removeChildren(0, 2);
            expect(removed.length).to.be.equals(1);
        });

        it('should throw outside acceptable range', function ()
        {
            const container = new Container();

            container.addChild(new DisplayObject());

            expect(() => container.removeChildren(2))
                .to.throw('removeChildren: numeric values are outside the acceptable range.');
            expect(() => container.removeChildren(-1))
                .to.throw('removeChildren: numeric values are outside the acceptable range.');
            expect(() => container.removeChildren(-1, 1))
                .to.throw('removeChildren: numeric values are outside the acceptable range.');
        });
    });

    describe('destroy', function ()
    {
        it('should not destroy children by default', function ()
        {
            const container = new Container();
            const child = new DisplayObject();

            container.addChild(child);
            container.destroy();

            expect(container.children.length).to.be.equals(0);
            expect(child.transform).to.not.be.null;
        });

        it('should allow children destroy', function ()
        {
            let container = new Container();
            let child = new DisplayObject();

            container.addChild(child);
            container.destroy({ children: true });

            expect(container.children.length).to.be.equals(0);
            expect(container.transform).to.be.null;
            expect(child.transform).to.be.null;

            container = new Container();
            child = new DisplayObject();

            container.addChild(child);
            container.destroy(true);

            expect(container.children.length).to.be.equals(0);
            expect(container.transform).to.be.null;
            expect(child.transform).to.be.null;
        });
    });

    describe('width', function ()
    {
        it('should reset scale', function ()
        {
            const container = new Container();

            container.scale.x = 2;
            container.width = 5;

            expect(container.width).to.be.equals(0);
            expect(container.scale.x).to.be.equals(1);
        });
    });

    describe('height', function ()
    {
        it('should reset scale', function ()
        {
            const container = new Container();

            container.scale.y = 2;
            container.height = 5;

            expect(container.height).to.be.equals(0);
            expect(container.scale.y).to.be.equals(1);
        });
    });

    function assertRemovedFromParent(parent, container, child, functionToAssert)
    {
        parent.addChild(child);

        expect(parent.children.length).to.be.equals(1);
        expect(child.parent).to.be.equals(parent);

        functionToAssert();

        expect(parent.children.length).to.be.equals(0);
        expect(child.parent).to.be.equals(container);
    }
});
