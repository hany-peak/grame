const GrameCoin = artifacts.require("GrameCoin");
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

/**
 * 
 * 
 * 
 * 
*/

contract('BASIC TEST [GRAME]', async accounts => {
    const [ host1, host2, host3, host4, host5, 
        host6, host7, host8, host9, host10 ] = accounts;
    
    const timeTravel = function (time) {
        return new Promise((resolve, reject) => {
            web3.currentProvider.send({
                jsonrpc : "2.0",
                method : "evm_increaseTime",
                params : [time], //86,400 is num seconds in day
                id : new Date().getTime()
            }, (err, result) => {
                if (err) { return reject(err)}
                return resolve(result)
            });
        }) 
    };
    
    describe('1. 기본 권한 테스트', () => {
        
        it("hiddenSupervisor", async() => {
            
            let grame = await GrameCoin.deployed();
            
            let addr = await grame.hidden_supervisor();
            
            assert.equal(addr, host1, "host1 is not hiddenSupervisor");

        });

        it("supervisor", async() => {

            let grame = await GrameCoin.deployed();
            
            let addr = await grame.supervisor();
            
            assert.equal(addr, host1, "host1 is not supervisor");
        });

        it("owner", async() => {

            let grame = await GrameCoin.deployed();
            
            let addr = await grame.owner();
            
            assert.equal(addr, host1, "host1 is not owner");
        });

        it("banker", async() => {

            let grame = await GrameCoin.deployed();
            
            let addr = await grame.banker();
            
            assert.equal(addr, host1, "host1 is not banker");
        });

        it("director1", async() => {

            let grame = await GrameCoin.deployed();
            
            let addr = await grame.director1();
            
            assert.equal(addr, host1, "host1 is not director1");
        });

        it("director2", async() => {

            let grame = await GrameCoin.deployed();
            
            let addr = await grame.director2();
            
            assert.equal(addr, host1, "host1 is not director2");
        });

        it("director3", async() => {

            let grame = await GrameCoin.deployed();
            
            let addr = await grame.director3();
            
            assert.equal(addr, host1, "host1 is not director3");
        });

        it("operator", async() => {

            let grame = await GrameCoin.deployed();
            
            let addr = await grame.operator(host1);
            
            assert.equal(addr, false, "host1 is not operator");
        });

        it("director1_signature", async() => {

            let grame = await GrameCoin.deployed();
            
            let flag = await grame.director1_signature();
            
            assert.equal(flag, false, "flag is not true");
        });

        it("director2_signature", async() => {

            let grame = await GrameCoin.deployed();
            
            let flag = await grame.director2_signature();
            
            assert.equal(flag, false, "flag is not true");
        });

        it("director3_signature", async() => {

            let grame = await GrameCoin.deployed();
            
            let flag = await grame.director3_signature();
            
            assert.equal(flag, false, "flag is not false");
        });

        it("change director1,2,3Signature", async() => {
            
            let grame = await GrameCoin.deployed();
            
            await grame.director1Signature({from:host1});
            let flag1 = await grame.director1_signature();
            
            assert.equal(flag1, true, "flag1 is not true");
            
            await grame.director2Signature({from:host1});
            let flag2 = await grame.director2_signature();
            
            assert.equal(flag2, true, "flag2 is not true");
            
            await grame.director3Signature({from:host1});
            let flag3 = await grame.director3_signature();

            assert.equal(flag3, true, "flag3 is not true");

            //signature1,2,3 초기화
            await grame.SignatureInvalidity({from:host1});

            let reset = await grame.director2_signature();
            assert.equal(reset, false, "is not false");
        });

        it("transferHiddenSupervisor", async() => {

            let grame = await GrameCoin.deployed();
            //현재 히든 수퍼바이저 조회
            let addr = await grame.hidden_supervisor();
            assert.equal(addr, host1, "host1 is not hiddenSupervisor");
            await grame.transferHiddenSupervisor(host2, {from:host2}).should.be.rejected;
            await grame.transferHiddenSupervisor(host2, {from:host1}).should.be.fulfilled;
            //바뀐 히든 수퍼바이저 조회
            addr = await grame.hidden_supervisor();
            assert.equal(addr, host2, "host2 is not hiddenSupervisor");
        
        });

        it("transferSupervisor", async() => {

            let grame = await GrameCoin.deployed();
            //현재 수퍼바이저 조회
            let addr = await grame.supervisor();
            assert.equal(addr, host1, "host1 is not ㄴupervisor");
            //올바른 권한을 가진 사용자가 기존 회사 롤을 가지고 있는 사람에게 주는 경우 (rejected)
            await grame.transferSupervisor(host2, {from:host2}).should.be.rejected;
            //잘못된 권한을 가진 사용자가 회사 롤을 가지고 있지 않는 사람에게 주는 경우 (rejected)
            await grame.transferSupervisor(host3, {from:host3}).should.be.rejected;

            await grame.transferSupervisor(host3, {from:host2}).should.be.fulfilled;
            
            addr = await grame.supervisor();

            assert.equal(addr, host3, "host3 is not supervisor");
        
        });

        //host2 hiddenSupervisor
        //host3 Supervisor
        it("transferBankOwner", async() => {
            let grame = await GrameCoin.deployed();

            let banker = await grame.banker();

            assert.equal(banker, host1, "host1 is not banker");

            //히든수퍼바이저가 권한 없는 사용자에게 뱅커 권한을 이전하는 경우 : 수퍼바이저만 이전이 가능하다.
            await grame.transferBankOwner(host4,{from:host2}).should.be.rejected;
            
            //올바른 이전 권한을 가진 사용자이지만 이미 다른 권한을 가진 경우 이전 불가하다
            await grame.transferBankOwner(host2,{from:host3}).should.be.rejected;
            
            //가능
            await grame.transferBankOwner(host4,{from:host3}).should.be.fulfilled;
        });

        //host2 hiddenSupervisor
        //host3 Supervisor
        //host4 banker

        it("transferOwnership", async() => {
            let grame = await GrameCoin.deployed();
            let owner = await grame.owner();

            assert.equal(host1, owner, "host1 is not owner");
            //수퍼바이저가 아닌 사용자가 오너쉽을 바꾸려고 하는 경우 : rejected
            await grame.transferOwnership(host5,{from:host2}).should.be.rejected;

            //수퍼바이저가 오너쉽을 바꾸지만 이미 권한을 가진 사용자인 경우
            await grame.transferOwnership(host4,{from:host3}).should.be.rejected;

            await grame.transferOwnership(host5,{from:host3}).should.be.fulfilled;
            
            owner = await grame.owner();
            assert.equal(host5, owner, "host5 is not owner");
        });
        //host2 hiddenSupervisor
        //host3 Supervisor
        //host4 banker
        //host5 owner
        it("transferDirector1", async() => {
            let grame = await GrameCoin.deployed();
            let director1 = await grame.director1();
            // let superV = await grame.supervisor();
            // let hiddenV = await grame.hidden_supervisor();
            // assert.equal(superV, host3, "host3 is not superV");
            // assert.equal(hiddenV, host2, "host2 is not hiddenV");
            assert.equal(host1, director1, "host1 is not director1");
            //수퍼바이저가 아닌 사용자가 디렉터 권한을 바꾸려고 하는 경우 : rejected
            await grame.transferDirector1(host6,{from:host2}).should.be.rejected;

            //수퍼바이저가 디렉터 권한을 바꾸지만 이미 권한을 가진 사용자인 경우
            await grame.transferDirector1(host5,{from:host3}).should.be.rejected;

            await grame.transferDirector1(host6,{from:host3}).should.be.fulfilled;
            
            director1 = await grame.director1();
            assert.equal(host6, director1, "host6 is not director1");
        });

        it("transferDirector2", async() => {
            let grame = await GrameCoin.deployed();
            let director2 = await grame.director2();

            assert.equal(host1, director2, "host1 is not director2");
            //수퍼바이저가 아닌 사용자가 디렉터 권한을 바꾸려고 하는 경우 : rejected
            await grame.transferDirector2(host7,{from:host2}).should.be.rejected;

            //수퍼바이저가 디렉터 권한을 바꾸지만 이미 권한을 가진 사용자인 경우
            await grame.transferDirector2(host6,{from:host3}).should.be.rejected;

            await grame.transferDirector2(host7,{from:host3}).should.be.fulfilled;
            
            director2 = await grame.director2();
            assert.equal(host7, director2, "host7 is not director2");
        });


        it("transferDirector3", async() => {
            let grame = await GrameCoin.deployed();
            let director3 = await grame.director3();

            assert.equal(host1, director3, "host1 is not director3");
            //수퍼바이저가 아닌 사용자가 디렉터 권한을 바꾸려고 하는 경우 : rejected
            await grame.transferDirector3(host8,{from:host2}).should.be.rejected;

            //수퍼바이저가 디렉터 권한을 바꾸지만 이미 권한을 가진 사용자인 경우
            await grame.transferDirector3(host7,{from:host3}).should.be.rejected;

            await grame.transferDirector3(host8,{from:host3}).should.be.fulfilled;
            
            director3 = await grame.director3();
            assert.equal(host8, director3, "host8 is not director3");
        });

        it("setOperator", async() => {

            let grame = await GrameCoin.deployed();            
            
            //권한을 가지지 않은 사용자가 권한을 이전하는 경우
            await grame.setOperator(host3,{from:host2}).should.be.rejected;
            
            //권한을 가진 사용자가 이미 권한을 가진 사용자에게 권한을 이전하는 경우
            await grame.setOperator(host4,{from:host3}).should.be.rejected;
            
            //정상적인 경우
            await grame.setOperator(host9,{from:host3}).should.be.fulfilled;
            
        });

        it("disableOperator", async() => {

            let grame = await GrameCoin.deployed();            
            
            //권한을 가지지 않은 사용자가 권한을 이전하는 경우
            await grame.disableOperator(host3,{from:host2}).should.be.rejected;
            
            //권한을 가진 사용자가 이미 권한을 가진 사용자에게 권한을 이전하는 경우
            await grame.disableOperator(host4,{from:host3}).should.be.rejected;
            
            //정상적인 경우
            await grame.disableOperator(host9,{from:host3}).should.be.fulfilled;
            await grame.setOperator(host9,{from:host3}).should.be.fulfilled;
        });

        it("blackList", async () => {
            let grame = await GrameCoin.deployed();

            let sign = await grame.blackList(host3);

            assert.equal(sign, false, "host3 is blackList");
        });

        it("setLockAddress", async() => {
            let grame = await GrameCoin.deployed();
            let owner = await grame.owner();
            let operator = host9;
            //오너를 블랙리스트 하려는 경우
            await grame.setLockAddress(owner, {from:owner}).should.be.rejected;
            await grame.setLockAddress(owner, {from:operator}).should.be.rejected;
            
            //이미 블랙리스트인 대상을 블랙리스트하려는 경우
            await grame.setLockAddress(operator, {from:operator}).should.be.fulfilled;
            await grame.setLockAddress(operator, {from:operator}).should.be.rejected;
            //오너 또는 operator가 아닌 사용자가 블랙리스트를 실행하려는 경우
            await grame.setLockAddress(operator, {from:host1}).should.be.rejected;
            //정상적인 경우
            await grame.unLockAddress(operator, {from:operator}).should.be.fulfilled;
            await grame.setLockAddress(operator, {from:operator}).should.be.fulfilled;
        });

        it("unLockAddress", async() => {
            let grame = await GrameCoin.deployed();
            let owner = await grame.owner();
            let operator = host9;

            await grame.unLockAddress(operator, {from:owner}).should.be.fulfilled;
            //이미 화이트리스트인 대상을 화이트리스트하려는 경우
            await grame.unLockAddress(operator, {from:operator}).should.be.rejected;
            
            //오너 또는 operator가 아닌 사용자가 를 unLockAddress를 실행하려는 경우
            await grame.unLockAddress(operator, {from:host1}).should.be.rejected;
            //정상적인 경우
            await grame.setLockAddress(operator, {from:owner}).should.be.fulfilled;
            await grame.unLockAddress(operator, {from:operator}).should.be.fulfilled;
        });

        it("pause & unpause & paused", async() => {
            let grame = await GrameCoin.deployed();
            let paused = await grame.paused();
            let owner = await grame.owner();
            let operator = host9;
            assert.equal(paused, false, "is paused");

            //권한을 가지지 않은 사용자가 실행하는 경우
            await grame.pause({from:host1}).should.be.rejected;
            //권한을 가진 사용자가 실행하는 경우
            await grame.pause({from:operator}).should.be.fulfilled;
            
            paused = await grame.paused();
            assert.equal(paused, true, "is not paused");
            //이미 paused == true인 상황에서 다시 실행하는 경우
            await grame.pause({from:owner}).should.be.rejected;

            await grame.unpause({from:owner}).should.be.fulfilled;

            paused = await grame.paused();
            assert.equal(paused, false, "is paused");

            await grame.unpause({from:operator}).should.be.rejected;
        });

        it("multiTransfer", async() => {
            let grame = await GrameCoin.deployed();
            let owner = await grame.owner();
            let supervisor = await grame.supervisor();
            let amt1 = 10000;
            let amt2 = 1000;
            let _toGroup = [host4,host5,host6,host7];
            let _toGroupT = [supervisor,host5,host6,host7];
            let _amountGroup = [amt2, amt2, amt2, amt2];
            
            await grame.transfer(owner, amt1, {from:host1}).should.be.fulfilled;
            //권한을 가지지 않은 사용자가 함수를 실행하는 경우
            await grame.multiTransfer(_toGroup, _amountGroup, {from:supervisor}).should.be.rejected;
            //superVisor가 포함된 경우 
            await grame.multiTransfer(_toGroupT, _amountGroup, {from:owner}).should.be.rejected;
            //정상적인 경우
            await grame.multiTransfer(_toGroup, _amountGroup, {from:owner}).should.be.fulfilled;

        });

        it("unlockDate, setSendTime, getSendTime", async() =>{
            let grame = await GrameCoin.deployed();
            let banker = await grame.banker();
            await grame.setSendTime(10,{from:banker}).should.be.fulfilled;
            let unlockDate = await grame.unlockDate();
            let getSendTime = await grame.getSendTime({from:banker});
            console.log('unlockDate : ', parseFloat(unlockDate));
            console.log('getSendTime : ', parseFloat(getSendTime));
        });

        it('trnasferBanker', async() => {
            let grame = await GrameCoin.deployed();
            let banker = await grame.banker();
            let supervisor = await grame.supervisor();
            let owner = await grame.owner();
            let director1 = await grame.director1();
            let director2 = await grame.director2();
            let director3 = await grame.director3();
            let amt1 = 100000;
            let amt2 = 10000;

            await grame.transfer(banker, amt1, {from: host1}).should.be.fulfilled;
            //sendTime 변경
            await grame.setSendTime(1000,{from:banker}).should.be.fulfilled;
            //owner가 아닌 사용자에게 보내는 경우 : revert
            await grame.transferBanker(supervisor, amt2, {from:banker}).should.be.rejected;
            
            timeTravel(5000);
            //현재시간이 unlockDate 시간보다 지난 경우
            await grame.transferBanker(owner, amt2, {from:banker}).should.be.rejected;
            
            await grame.setSendTime(10000,{from:banker}).should.be.fulfilled;

            await grame.transferBanker(owner, amt2, {from:banker}).should.be.rejected;

            // director1, director2, director3의 시그널을 다 true로 변경한 경우
            await grame.director1Signature({from:director1}).should.be.fulfilled;
            await grame.director2Signature({from:director2}).should.be.fulfilled;
            await grame.director3Signature({from:director3}).should.be.fulfilled;

            await grame.transferBanker(owner, amt2, {from:banker}).should.be.fulfilled;
        });

        it('burnAdminAmount', async() => {
            let grame = await GrameCoin.deployed();
            let owner = await grame.owner();
            let totalSupply = await grame.totalSupply();
            totalSupply = totalSupply.toString();
            assert.equal(totalSupply, '10000000000000000000000000000');

            let ownerBalance = await grame.balanceOf(owner);
            ownerBalance = ownerBalance.toString();
            
            assert.equal(ownerBalance, '17000');
            //오너가 아닌 경우
            await grame.burnAdminAmount(10000,{from:host1}).should.be.rejected;

            //오너가 보유한 금액보다 큰 금액을 번 시키려고 하는 경우
            await grame.burnAdminAmount(20000,{from:owner}).should.be.rejected;
            //정상적인 경우
            await grame.burnAdminAmount(10000,{from:owner}).should.be.fulfilled;

            ownerBalance = await grame.balanceOf(owner);
            ownerBalance = ownerBalance.toString();
            
            assert.equal(ownerBalance, '7000');

            totalSupply = await grame.totalSupply();
            totalSupply = totalSupply.toString();
            assert.equal(totalSupply, '9999999999999999999999990000');
        });

        it('burnHackingAmount', async() => {
            let grame = await GrameCoin.deployed();
            let director1 = await grame.director1();
            let director2 = await grame.director2();
            let owner = await grame.owner();
            let supervisor = await grame.supervisor();
            let host5Balance = await grame.balanceOf(host5);
            host5Balance = host5Balance.toString();
            console.log('host5Balance : ', host5Balance);
            // 실행자가 오너가 아닌 경우
            await grame.burnHackingAmount(host5, "해킹된 사용자",{from:supervisor}).should.be.rejected;
            //시그널 안받은 경우
            await grame.burnHackingAmount(host5, "해킹된 사용자",{from:owner}).should.be.rejected;
            
            await grame.director1Signature({from:director1}).should.be.fulfilled;
            await grame.director2Signature({from:director2}).should.be.fulfilled;
            
            await grame.burnHackingAmount(host5, "해킹된 사용자",{from:owner}).should.be.fulfilled;

            host5Balance = await grame.balanceOf(host5);
            host5Balance = host5Balance.toString();
            console.log('host5Balance : ', host5Balance);
        });

        it('locker & lockerOf & setLock check', async() => {
            let grame = await GrameCoin.deployed();
            let amt1 = 10000;
            let owner = await grame.owner();
            let supervisor = await grame.supervisor();
            let lockValue = await grame.locker();
            lockValue = lockValue.toString();
            assert.equal(lockValue, '0');

            lockValue = await grame.locker(host1);
            lockValue = lockValue.toString();
            assert.equal(lockValue, '0');

            lockValue = await grame.lockerOf(host1);
            lockValue = lockValue.toString();
            assert.equal(lockValue, '0');

            //setLock을 오너가 아닌 사용자가 하는 경우

            await grame.setLock(owner, amt1, {from:supervisor}).should.be.rejected;

            await grame.setLock(host1, amt1, {from:owner}).should.be.fulfilled;

            lockValue = await grame.lockerOf(host1);
            lockValue = lockValue.toString();
            assert.equal(lockValue, '10000');
        });

        it('recall', async() => {
            let grame = await GrameCoin.deployed();
            let amt1 = 5000;
            let amt2 = 10000;
            let amt3 = 20000;
            let owner = await grame.owner();
            let ownerBalance = await grame.balanceOf(owner);
            //오너가 아닌 사용자가 recall 하는 경우
            assert.equal(0, parseFloat(ownerBalance));
            await grame.recall(host1, amt1, {from:host1}).should.be.rejected;
            //recall 하려는 양이 recall 대상의 보유하는 양보다 큰 경우
            await grame.recall(host1, amt3, {from:owner}).should.be.rejected;

            await grame.recall(host1, amt2, {from:owner}).should.be.fulfilled;
            ownerBalance = await grame.balanceOf(owner);
            assert.equal(amt2, parseFloat(ownerBalance));
        });


        it('multiLock', async() => {
            let grame = await GrameCoin.deployed();
            let owner = await grame.owner();
            let amt1 = 1000;
            let _toGroup = [host4,host6,host7,host8];
            let _amountGroup = [amt1,amt1,amt1,amt1];
            let totalSupply = await grame.totalSupply();
            console.log('ts', totalSupply.toString());
            //오너가 아닌 사용자가 실행하는 경우
            await grame.multiLock(_toGroup, _amountGroup, {from: host1}).should.be.rejected;
            
            await grame.setLock(host4, amt1, {from : owner}).should.be.fulfilled;
            await grame.setLock(host6, amt1, {from : owner}).should.be.fulfilled;
            await grame.setLock(host7, amt1, {from : owner}).should.be.fulfilled;
            await grame.setLock(host8, amt1, {from : owner}).should.be.fulfilled;
            console.log(1);
            await grame.multiLock(_toGroup, _amountGroup, {from: owner}).should.be.fulfilled;
            let chkLockValuelist = [];
            for(let i = 0; i < _toGroup.length; i++) {
                let val = await grame.lockerOf(_toGroup[i]);

                chkLockValuelist.push(parseFloat(val));
            };
            console.log('chk', chkLockValuelist);
        })


        it('transfer' , async() => {

            let grame = await GrameCoin.deployed();
            let owner = await grame.owner();
            let banker = await grame.banker();
            let supervisor = await grame.supervisor();
            let hidden_supervisor = await grame.hidden_supervisor();
            let amt1 = 1000;
            let paused = await grame.paused();
            assert.equal(false, paused);
            
            //일반적인 경우
            await grame.transfer(host9, amt1, {from:host1}).should.be.fulfilled;
            
            // paused 인 경우 : revert
            await grame.pause({from: owner});
            paused = await grame.paused();
            assert.equal(true, paused);
            await grame.transfer(host9, amt1, {from:host1}).should.be.rejected;
            await grame.unpause({from: owner});
            paused = await grame.paused();
            assert.equal(false, paused);
            await grame.transfer(host9, amt1, {from:host1}).should.be.fulfilled;
            
            // 보내려는 사용자가 블랙리스트인 경우
            await grame.setLockAddress(host1,{from:owner}).should.be.fulfilled;

            let isBlacklist = await grame.blackList(host1);
            assert.equal(true, isBlacklist);
            await grame.transfer(host9, amt1, {from:host1}).should.be.rejected;

            await grame.unLockAddress(host1,{from:owner}).should.be.fulfilled;
            isBlacklist = await grame.blackList(host1);
            assert.equal(false, isBlacklist);
            await grame.transfer(host9, amt1, {from:host1}).should.be.fulfilled;
            
            console.log('test1');

            // msg.sender && to 사용자에 supervisor, hidden_supervisor가 포함된 경우
            await grame.transfer(supervisor, amt1, {from:host1}).should.be.rejected;
            await grame.transfer(hidden_supervisor, amt1, {from:host1}).should.be.rejected;
            // 보내려는 사용자가 banker인 경우 : revert
            await grame.transfer(hidden_supervisor, amt1, {from:banker}).should.be.rejected;
            

            await grame.transfer(host7, amt1, {from:host1}).should.be.fulfilled;
            let host7Balance = await grame.balanceOf(host7);
            host7Balance = host7Balance.toString();
            assert.equal(host7Balance, '2000');
            // 보내려는 금액이 자신의 보유 잔고 총액 - 자신의 락된 value보다 큰 경우 - 1
            await grame.setLock(host7, 1500, {from: owner}).should.be.fulfilled;
            let lockValue = await grame.locker(host7);
            lockValue = parseFloat(lockValue);

            console.log('lockValue : ' , lockValue);
            // 보내려는 금액이 자신의 보유 잔고 총액 - 자신의 락된 value보다 큰 경우 - 2
            assert.equal(lockValue, 1500, "not sufficient lockValue");
            
            //host7 lockValue : 1500
            //host7 balance : 2000
            await grame.transfer(host1, 100, {from:host7}).should.be.fulfilled;

            //host7 lockValue : 1500
            //host7 balance : 1900
            await grame.transfer(host1, 1600, {from:host7}).should.be.rejected;
            
            await grame.transfer(host1, 400, {from:host7}).should.be.fulfilled;

            
        });

        it('transferFrom & approve' ,async() => {
            
            let grame = await GrameCoin.deployed();
            let owner = await grame.owner();
            let banker = await grame.banker();
            let supervisor = await grame.supervisor();
            let hidden_supervisor = await grame.hidden_supervisor();
            let amt1 = 1000;
            let paused = await grame.paused();
            assert.equal(paused, false, "is paused");
            
            await grame.approve(host7, amt1 ,{from:host1}).should.be.fulfilled;
            
            // paused 인 경우 : revert
            await grame.pause({from : owner});
            paused = await grame.paused();
            assert.equal(paused, true, "is not paused");
            
            await grame.approve(host7, amt1 ,{from:host1}).should.be.rejected;

            await grame.unpause({from:owner});
            paused = await grame.paused();
            assert.equal(paused, false, "is paused");
            
            await grame.approve(host7, amt1 ,{from:host1}).should.be.fulfilled;
            //approve test
            //뱅커는 사용 불가
            await grame.approve(host7, amt1 ,{from:banker}).should.be.rejected;
        
            // 보내려는 사용자가 블랙리스트인 경우
            await grame.setLockAddress(host1,{from:owner}).should.be.fulfilled;
            await grame.approve(host7, amt1 ,{from:host1}).should.be.rejected;
            await grame.unLockAddress(host1,{from:owner}).should.be.fulfilled;
            await grame.approve(host7, amt1 ,{from:host1}).should.be.fulfilled;
            // from && to 사용자에 supervisor, hidden_supervisor가 포함된 경우
            let val = await grame.lockerOf(host7);
            val = val.toString();
            console.log('val : ', val);
            let val2 = await grame.allowance(host1, host7);
            val2 = val2.toString();
            console.log('val2 : ', val2);
            
            await grame.transferFrom(host1, host8, 10, {from : host7}).should.be.fulfilled;
            //보내려는 msg.sender가 블랙리스트인 경우
            await grame.setLockAddress(host7,{from:owner}).should.be.fulfilled;
            await grame.transferFrom(host1, host8, 10, {from : host7}).should.be.rejected;
            await grame.unLockAddress(host7,{from:owner}).should.be.fulfilled;
            await grame.transferFrom(host1, host8, 10, {from : host7}).should.be.fulfilled;
            
            //보내는 것 또는 받는 사용자가 supervisor, hidden_supervisor인 경우
            await grame.transferFrom(host1, supervisor, 10, {from : host7}).should.be.rejected;
            await grame.transferFrom(host1, hidden_supervisor, 10, {from : host7}).should.be.rejected;

        });
    })
})

