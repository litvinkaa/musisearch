import {makeAutoObservable} from 'mobx'
export default class AssosiationSearchStore{
    constructor(){
        
        this._foundAssosiations = []
        this._chosenAssosiation = {}
        this._lastPage = {}
        this._searchParams = {}
        makeAutoObservable(this)

    }
    setfoundAssosiations(assosiations)
    {
        this._foundAssosiations = assosiations;

    }
    setchosenAssosiation(assosiation)
    {
        this._chosenAssosiation = assosiation;

    }
    setlastPage(page)
    {
        this._lastPage = page;

    }
    setsearchParams(params)
    {
        this._searchParams = params;

    }
   
    get foundAssosiations()
    {
        return this._foundAssosiations;
    }
    get chosenAssosiation()
    {
        return this._chosenAssosiation;
    }
    get lastPage()
    {
        return this._lastPage;
    }

    get searchParams()
    {
        return this._searchParams;

    }
    
    
}