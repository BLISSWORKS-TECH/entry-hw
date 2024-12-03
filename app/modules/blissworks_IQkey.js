// Packet structure
// --entry-hw -> remocon
// 0x0A 0x55 COMType LEN from To DATA(COM, DIR1, DIR2 DIR3, M1sp, M2Sp, M3sp, RES1, RES2, 0XFF, 0xFF)
// --remocon -> entry-hw
// 00x0A 0x55 INFO LEN From To DATA(P_STAT, sen1, sen2, sen3, CRCL, CRCH)


const BaseModule = require('./baseModule');

class IQkey extends BaseModule {

    constructor() {
        super();

        this.HEADER1 = 0;
        this.HEADER2 = 1;
        this.COMTYPE = 2;
        this.LEN = 3; 
        this.FROM = 4;
        this.TO = 5;

        this.COM = 6;
        this.DIR1 = 7;
        this.DIR2 = 8;
        this.DIR3 = 9;
        this.M1SP = 10;
        this.M2SP = 11;
        this.M3SP = 12;
        this.RES1 = 13;
        this.RES2 = 14;
        this.DELI1 = 15;
        this.DELI2 = 16;
        this.SEND_PACKET_LENGTH = 17;

        
        this.INFO = 2;        
        this.P_STAT = 6;
        this.SEN1 = 7;
        this.SEN2 = 8;
        this.SEN3 = 9;
        this.CRCL = 10;
        this.CRCH = 11;
        //this.DELI1 = 12;
        //this.DELI2 = 13;
        
        this.RECEIVE_PACKET_LENGTH = 14;
        this.COMTYPE_COMMAND = 1;
        this.SEND_PACKET_PAYLOAD= 9;
        this.REMOCON = 1;
        this.ENTRY_HW = 2;

        this.counter = 0;

        this.foo = 0;
        this.sp = null;

        //data to Entry
        this.inputData = {
            pInfo: 0,
            pSize: 0,
            pStat: 0,
            sensor: {
                SEN1: 0,
                SEN2: 0,
                SEN3: 0,
            },          
        };

        //data from entry
        this.dataFromEntry = {
            com: 0,
            Mdir1: 0,
            Mdir2: 0,
            Mdir3: 0,
            Mspd1: 0,
            Mspd2: 0,
            Mspd3: 0,
            res1:0,
            res2:0,
        };

        this.sPacket = new Array(this.SEND_PACKET_LENGTH);
        for (var j = 0; j < this.SEND_PACKET_LENGTH; j++) {
            this.sPacket[j] = 0x00;
        }

    }

    init(handler, config) {

    }

    requestInitialData(sp) {

        return null;
    }

    // 연결 후 초기에 수신받아서 정상연결인지를 확인해야하는 경우 사용합니다.
    checkInitialData(data, config) {

        return true;
    }

    // optional. 하드웨어에서 받은 데이터의 검증이 필요한 경우 사용합니다.
    validateLocalData(data) {

        return true;
    }

    // 엔트리로 전달할 데이터
    requestRemoteData(handler) {
        //console.log('send hardware data to entry');
        handler.write("inputData", this.inputData);
    }

    crc16_ccitt(buf) {
        var crcTable = [
            0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7,
            0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef,
            0x1231, 0x0210, 0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6,
            0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de,
            0x2462, 0x3443, 0x0420, 0x1401, 0x64e6, 0x74c7, 0x44a4, 0x5485,
            0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d,
            0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6, 0x5695, 0x46b4,
            0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d, 0xc7bc,
            0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
            0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b,
            0x5af5, 0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12,
            0xdbfd, 0xcbdc, 0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a,
            0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41,
            0xedae, 0xfd8f, 0xcdec, 0xddcd, 0xad2a, 0xbd0b, 0x8d68, 0x9d49,
            0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70,
            0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a, 0x9f59, 0x8f78,
            0x9188, 0x81a9, 0xb1ca, 0xa1eb, 0xd10c, 0xc12d, 0xf14e, 0xe16f,
            0x1080, 0x00a1, 0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
            0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c, 0xe37f, 0xf35e,
            0x02b1, 0x1290, 0x22f3, 0x32d2, 0x4235, 0x5214, 0x6277, 0x7256,
            0xb5ea, 0xa5cb, 0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d,
            0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405,
            0xa7db, 0xb7fa, 0x8799, 0x97b8, 0xe75f, 0xf77e, 0xc71d, 0xd73c,
            0x26d3, 0x36f2, 0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634,
            0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9, 0xb98a, 0xa9ab,
            0x5844, 0x4865, 0x7806, 0x6827, 0x18c0, 0x08e1, 0x3882, 0x28a3,
            0xcb7d, 0xdb5c, 0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
            0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0, 0x2ab3, 0x3a92,
            0xfd2e, 0xed0f, 0xdd6c, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8, 0x8dc9,
            0x7c26, 0x6c07, 0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1,
            0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8,
            0x6e17, 0x7e36, 0x4e55, 0x5e74, 0x2e93, 0x3eb2, 0x0ed1, 0x1ef0
        ];

        var crc = 0x0000;
        var j, i;
        for (i = 0; i < buf.length; i++) {
            let c = buf[i];
            if (c > 255) {
                throw new RangeError();
            }
            j = (c ^ (crc >> 8)) & 0xFF;
            crc = crcTable[j] ^ (crc << 8);
        }
        return ((crc ^ 0) & 0xFFFF);
    }


    // 엔트리에서 받은 데이터에 대한 처리
    handleRemoteData(handler) {

        //console.log('read data from entry');

        Object.keys(this.dataFromEntry).forEach((port) => {
            this.dataFromEntry[port] = handler.read(port);
        });

        this.sPacket[this.HEADER1] = 0x54;
        this.sPacket[this.HEADER2] = 0x55;
        this.sPacket[this.COMTYPE] = this.COMTYPE_COMMAND;
        this.sPacket[this.LEN] = this.SEND_PACKET_PAYLOAD;
        this.sPacket[this.FROM] = this.ENTRY_HW;
        this.sPacket[this.TO] = this.REMOCON;
        this.sPacket[this.COM] = this.dataFromEntry.com;
        this.sPacket[this.DIR1] = this.dataFromEntry.Mdir1;
        this.sPacket[this.DIR2] = this.dataFromEntry.Mdir2;
        this.sPacket[this.DIR3] = this.dataFromEntry.Mdir3;
        this.sPacket[this.M1SP] = this.dataFromEntry.Mspd1;
        this.sPacket[this.M2SP] = this.dataFromEntry.Mspd2;
        this.sPacket[this.M3SP] = this.dataFromEntry.Mspd3;
        this.sPacket[this.RES1] = this.dataFromEntry.res1;
        this.sPacket[this.RES2] = this.dataFromEntry.res2;

        //var crcBuff = this.sPacket.slice(2, this.SEND_PACKET_LENGTH - 4);
        //var crc16 = this.crc16_ccitt(crcBuff);
        //var crcL = crc16 & 0x00FF;
        //var crcH = (crc16 & 0xFF00) >> 8;

        //this.sPacket[this.CRC_L] = crcL;
        //this.sPacket[this.CRC_H] = crcH;
        this.sPacket[this.DELI1] = 36;
        this.sPacket[this.DELI2] = 36;
    }


    //하드웨어에 전달할 데이터
    requestLocalData() {

        //for (var j = 0; j < this.SEND_PACKET_LENGTH; j++) {
        //    process.stdout.write(" " + this.sPacket[j].toString(16));
        //} 
        //console.log(" ");    

        return this.sPacket;
    }

    // 하드웨어에서 온 데이터 처리
    handleLocalData(data) {

        console.log('receive packet from hardware');
        for (var j = 0; j < data.length; j++) {
            //process.stdout.write(" " + data[j].toString(16));
            //process.stdout.write(" " + String.fromCharCode(data[j]));
        }
        console.log(" ");

        if ((data[this.HEADER1 + 2] == 0x54) && (data[this.HEADER2 + 2] == 0x55)) {

            if (data.length < (this.PACKET_LENGTH - 4)) return;

            this.inputData.pInfo = data[this.INFO + 2];
            this.inputData.pSize = data[this.LEN + 2];
            this.inputData.pStat = data[this.P_STAT + 2];
            this.inputData.sensor.SEN1 = data[this.SEN1 + 2];
            this.inputData.sensor.SEN2 = data[this.SEN2 + 2];
            this.inputData.sensor.SEN3 = data[this.SEN3 + 2];           

            this.counter++;
            if (this.counter > 255) this.counter = 0;
            console.log("SEN1:" + this.inputData.sensor.SEN1 + " SEN2:" + this.inputData.sensor.SEN2 + " SEN3:" + this.inputData.sensor.SEN3);           
        }
    }
}

module.exports = new IQkey();